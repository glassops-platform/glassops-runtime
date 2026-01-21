import { ProtocolPolicy, ProtocolConfig } from './policy';
import * as core from '@actions/core';
import * as fs from 'fs';

jest.mock('@actions/core');

describe('ProtocolPolicy', () => {
    let policy: ProtocolPolicy;

    beforeEach(() => {
        policy = new ProtocolPolicy();
        jest.clearAllMocks();
    });

    describe('checkFreeze', () => {
        const mockConfig: ProtocolConfig = {
            governance: {
                enabled: true,
                freeze_windows: [
                    {
                        day: 'Friday',
                        start: '09:00',
                        end: '17:00'
                    }
                ]
            },
            runtime: { cli_version: 'latest', node_version: '20' }
        };

        it('should throw an error if the current time is within a freeze window', () => {
            const mockDate = new Date('2026-01-23T10:00:00Z'); 
            jest.useFakeTimers().setSystemTime(mockDate);

            expect(() => policy.checkFreeze(mockConfig)).toThrow(/FROZEN/);
        });

        it('should allow deployment if the current time is outside freeze windows', () => {
            const mockDate = new Date('2026-01-23T18:00:00Z');
            jest.useFakeTimers().setSystemTime(mockDate);

            expect(() => policy.checkFreeze(mockConfig)).not.toThrow();
        });

        it('should allow deployment if no freeze windows are defined', () => {
            const emptyConfig: ProtocolConfig = {
                governance: { enabled: true },
                runtime: { cli_version: 'latest', node_version: '20' }
            };
            expect(() => policy.checkFreeze(emptyConfig)).not.toThrow();
        });
    });

    describe('load', () => {
        it('should return a default unsafe policy if devops-config.json is missing', async () => {
            jest.spyOn(fs, 'existsSync').mockReturnValue(false);
            
            const config = await policy.load();
            
            expect(config.governance.enabled).toBe(false);
            expect(core.warning).toHaveBeenCalledWith(expect.stringContaining('Using default unsafe policy'));
        });
    });
});