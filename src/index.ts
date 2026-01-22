import * as cache from "@actions/cache";
import * as core from "@actions/core";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";
import { ProtocolPolicy } from "./protocol/policy";
import { RuntimeEnvironment } from "./services/cli";
import { IdentityResolver } from "./services/identity";
import { DeploymentContractSchema } from "./protocol/contract";

async function run(): Promise<void> {
  // Generate unique runtime ID for this execution session
  const runtimeId = crypto.randomUUID();
  core.setOutput("runtime_id", runtimeId);

  try {
    // 0. Cache Retrieval Phase
    core.startGroup("📦 Restoring GlassOps Runtime Cache");
    const cacheKey = `glassops-runtime-${process.platform}-${process.arch}-${process.version}`;
    const cachePaths = [
      path.join(process.env.HOME || process.env.USERPROFILE || ".", ".npm"),
      path.join(process.env.HOME || process.env.USERPROFILE || ".", ".sf"),
    ];

    const cacheHit = await cache.restoreCache(cachePaths, cacheKey);
    if (cacheHit) {
      core.info("✅ Cache restored successfully");
    } else {
      core.info("⚠️ Cache miss - will cache after bootstrap");
    }
    core.endGroup();

    // 1. Policy Phase
    const policyEngine = new ProtocolPolicy();
    const config = await policyEngine.load();

    if (core.getInput("enforce_policy") === "true") {
      try {
        policyEngine.checkFreeze(config);
        core.setOutput("is_locked", "false");
      } catch (freezeError) {
        core.setOutput("is_locked", "true");
        throw freezeError;
      }
    } else {
      core.setOutput("is_locked", "false");
    }

    // 2. Bootstrap Phase
    const runtime = new RuntimeEnvironment();
    await runtime.install(config.runtime.cli_version);

    // 3. Identity Phase
    const identity = new IdentityResolver();
    const orgId = await identity.authenticate({
      clientId: core.getInput("client_id"),
      jwtKey: core.getInput("jwt_key"),
      username: core.getInput("username"),
      instanceUrl: core.getInput("instance_url"),
    });

    // 4. Contract Validation Phase
    core.info("📄 Generating Deployment Contract v1.0...");

    const deploymentContract = DeploymentContractSchema.parse({
      schemaVersion: "1.0",
      meta: {
        adapter: "native",
        engine: "native",
        timestamp: new Date().toISOString(),
        trigger: process.env.GITHUB_EVENT_NAME || "manual",
      },
      status: "Succeeded",
      quality: {
        coverage: {
          actual: 0, // Placeholder - would be filled by actual deployment
          required: 75,
          met: false,
        },
        tests: {
          total: 0,
          passed: 0,
          failed: 0,
        },
      },
      audit: {
        triggeredBy: process.env.GITHUB_ACTOR || "unknown",
        orgId: orgId,
        repository: process.env.GITHUB_REPOSITORY || "unknown",
        commit: process.env.GITHUB_SHA || "unknown",
      },
    });

    // Write contract to file for cryptographic signing/archival
    const contractPath = path.join(
      process.env.GITHUB_WORKSPACE || ".",
      "glassops-contract.json",
    );
    fs.writeFileSync(contractPath, JSON.stringify(deploymentContract, null, 2));
    core.setOutput("contract_path", contractPath);

    // 5. Output Session State
    core.setOutput("org_id", deploymentContract.audit.orgId);
    core.setOutput("glassops_ready", "true");
    core.info("✅ GlassOps Runtime is ready for governed execution.");
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
