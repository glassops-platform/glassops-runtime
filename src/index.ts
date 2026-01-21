import * as core from '@actions/core';
import { z } from 'zod';
import { ProtocolPolicy } from './protocol/policy';
import { RuntimeEnvironment } from './services/cli';
import { IdentityResolver } from './services/identity';

// Define audit schema inline to avoid ncc bundling issues
const AuditSchema = z.object({
    triggeredBy: z.string(),
    orgId: z.string(),
    repository: z.string(),
    commit: z.string()
});

async function run(): Promise<void> {
    try {
        // 1. Policy Phase
        const policyEngine = new ProtocolPolicy();
        const config = await policyEngine.load();
        
        if (core.getInput('enforce_policy') === 'true') {
            policyEngine.checkFreeze(config);
        }

        // 2. Bootstrap Phase
        const runtime = new RuntimeEnvironment();
        await runtime.install(config.runtime.cli_version);

        // 3. Identity Phase
        const identity = new IdentityResolver();
        const orgId = await identity.authenticate({
            clientId: core.getInput('client_id'),
            jwtKey: core.getInput('jwt_key'),
            username: core.getInput('username'),
            instanceUrl: core.getInput('instance_url')
        });

        // 4. Contract Validation Phase
        core.info('📄 Validating Session Contract...');
        
        const sessionContract = AuditSchema.parse({
            triggeredBy: process.env.GITHUB_ACTOR || 'unknown',
            orgId: orgId,
            repository: process.env.GITHUB_REPOSITORY || 'unknown',
            commit: process.env.GITHUB_SHA || 'unknown'
        });

        // 5. Output Session State
        core.setOutput('org_id', sessionContract.orgId);
        core.setOutput('glassops_ready', 'true');
        core.info('✅ GlassOps Runtime is ready for governed execution.');

    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message);
    }
}

run();