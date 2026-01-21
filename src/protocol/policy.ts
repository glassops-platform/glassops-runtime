import * as core from '@actions/core';
import * as fs from 'fs';
import * as path from 'path';
import { z } from 'zod';

const ConfigSchema = z.object({
    governance: z.object({
        enabled: z.boolean().default(true),
        freeze_windows: z.array(z.object({
            day: z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']),
            start: z.string().regex(/^\d{2}:\d{2}$/),
            end: z.string().regex(/^\d{2}:\d{2}$/)
        })).optional()
    }),
    runtime: z.object({
        cli_version: z.string().default('latest'),
        node_version: z.string().default('20')
    })
});

export type ProtocolConfig = z.infer<typeof ConfigSchema>;

export class ProtocolPolicy {
    private configPath: string;

    constructor() {
        this.configPath = path.join(process.env.GITHUB_WORKSPACE || '.', 'devops-config.json');
    }

    public async load(): Promise<ProtocolConfig> {
        if (!fs.existsSync(this.configPath)) {
            core.warning('⚠️ No devops-config.json found. Using default unsafe policy.');
            return ConfigSchema.parse({
                governance: { enabled: false },
                runtime: {}
            });
        }

        try {
            const raw = fs.readFileSync(this.configPath, 'utf-8');
            const json = JSON.parse(raw);
            return ConfigSchema.parse(json);
        } catch (error) {
            throw new Error(`❌ Invalid Governance Policy: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    public checkFreeze(config: ProtocolConfig): void {
        if (!config.governance.freeze_windows) return;
        
        const now = new Date();
        
        // Use UTC to ensure deterministic behavior across runners
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const currentDay = days[now.getUTCDay()]; 
        
        const currentTime = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`;

        for (const window of config.governance.freeze_windows) {
            if (window.day === currentDay && currentTime >= window.start && currentTime <= window.end) {
                throw new Error(`❄️ FROZEN: Deployment blocked by governance window (${window.day} ${window.start}-${window.end})`);
            }
        }
    }
}