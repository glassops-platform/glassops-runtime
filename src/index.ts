import * as core from '@actions/core';
import { ProtocolPolicy } from './protocol/policy';
import { RuntimeEnvironment } from './services/cli';
import { IdentityResolver } from './services/identity';

async function run(): Promise<void> {
    try {
        // 1. Policy Phase
        const policyEngine = new ProtocolPolicy();
        const config = await policyEngine.load();
        
        // Enforce Freeze *before* installing anything
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

        // 4. Output Session State
        core.setOutput('org_id', orgId);
        core.setOutput('glassops_ready', 'true');

    } catch (error) {
        if (error instanceof Error) core.setFailed(error.message);
    }
}

run();