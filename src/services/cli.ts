import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as io from "@actions/io";

export class RuntimeEnvironment {
  public async install(version: string = "latest"): Promise<void> {
    core.startGroup("🔧 Bootstrapping GlassOps Runtime");

    const isInstalled = await io.which("sf", false);
    if (isInstalled) {
      core.info("⚡ Salesforce CLI detected in environment. skipping install.");
      core.endGroup();
      return;
    }

    core.info(`⬇️ Installing @salesforce/cli@${version}...`);
    try {
      await exec.exec("npm", ["install", "-g", `@salesforce/cli@${version}`]);

      await exec.exec("sf", ["version"]);
    } catch (err) {
      throw new Error(
        "❌ Failed to bootstrap runtime. NPM registry might be down.",
      );
    }

    core.endGroup();
  }
}
