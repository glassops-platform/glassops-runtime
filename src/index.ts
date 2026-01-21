import * as core from '@actions/core';
import { ProtocolPolicy } from './protocol/policy';
import { DeploymentContractSchema } from './protocol/contract'; 
import { RuntimeEnvironment } from './services/cli';
import { IdentityResolver } from './services/identity';

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
        
        const auditSchema = DeploymentContractSchema.pick({ audit: true });

        const validationResult = auditSchema.parse({
            audit: {
                triggeredBy: process.env.GITHUB_ACTOR || 'unknown',
                orgId: orgId,
                repository: process.env.GITHUB_REPOSITORY || 'unknown',
                commit: process.env.GITHUB_SHA || 'unknown'
            }
        });

        const sessionContract = validationResult.audit;

        // 5. Output Session State
        core.setOutput('org_id', sessionContract.orgId);
        core.setOutput('glassops_ready', 'true');
        core.info('✅ GlassOps Runtime is ready for governed execution.');

    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message);
    }
}

run();