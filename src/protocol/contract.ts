import { z } from "zod";

export const DeploymentContractSchema = z.object({
  schemaVersion: z.string().default("1.0"),
  meta: z.object({
    adapter: z.string(),
    engine: z.enum(["native", "hardis", "custom"]),
    timestamp: z.string().datetime(),
    trigger: z.string(),
  }),
  status: z.enum(["Succeeded", "Failed", "Blocked"]),
  quality: z.object({
    coverage: z.object({
      actual: z.number(),
      required: z.number(),
      met: z.boolean(),
    }),
    tests: z.object({
      total: z.number(),
      passed: z.number(),
      failed: z.number(),
    }),
  }),
  audit: z.object({
    triggeredBy: z.string(),
    orgId: z.string(),
    repository: z.string(),
    commit: z.string(),
  }),
});

export type DeploymentContract = z.infer<typeof DeploymentContractSchema>;
