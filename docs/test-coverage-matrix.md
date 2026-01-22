# Test Coverage Matrix

## RTM to Test File Mapping

This document maps Requirements Traceability Matrix (RTM) test cases to their actual test implementations in the codebase.

## Legend

| Status | Meaning                                 |
| ------ | --------------------------------------- |
| ✅     | Fully tested in unit/integration tests  |
| 🔶     | Tested via E2E GitHub Actions workflows |
| ⏳     | Planned for future implementation       |
| ❌     | Not applicable / Out of scope           |

---

## Business Requirements Coverage

### BR-001: Additive Policy Merge

| RTM Test ID | Description                            | Test File                    | Status |
| ----------- | -------------------------------------- | ---------------------------- | ------ |
| TC-001-P01  | GitHub floor 75%, config 80%, CMDT 90% | `policy.integration.test.ts` | 🔶 E2E |
| TC-001-P02  | GitHub floor 75%, config 80%, no CMDT  | `policy.integration.test.ts` | ✅     |
| TC-001-N04  | Malformed policy.json syntax           | `policy.integration.test.ts` | ✅     |

### BR-007: Pass/Fail Adjudication (Freeze Windows)

| RTM Test ID | Description                                 | Test File                    | Status |
| ----------- | ------------------------------------------- | ---------------------------- | ------ |
| TC-007-P02  | Production freeze window, deployment queued | `policy.integration.test.ts` | ✅     |
| TC-007-N01  | Coverage below threshold                    | `policy.integration.test.ts` | ✅     |

### BR-009: Adapter Interface Compliance

| RTM Test ID | Description                                    | Test File                 | Status |
| ----------- | ---------------------------------------------- | ------------------------- | ------ |
| TC-009-P01  | Custom adapter implements all required methods | `cli.integration.test.ts` | ✅     |
| TC-009-P02  | Adapter emits valid JSON even on tool crash    | `contract.test.ts`        | ✅     |

### BR-011: JWT Authentication Flow

| RTM Test ID | Description                  | Test File                      | Status |
| ----------- | ---------------------------- | ------------------------------ | ------ |
| TC-011-P01  | Valid JWT key, auth succeeds | `identity.integration.test.ts` | ✅     |
| TC-011-N01  | Invalid client ID            | `identity.integration.test.ts` | ✅     |
| TC-011-N02  | JWT key format corrupted     | `identity.integration.test.ts` | ✅     |

### BR-020: Plugin Whitelist Management

| RTM Test ID | Description                                    | Test File                    | Status |
| ----------- | ---------------------------------------------- | ---------------------------- | ------ |
| TC-020-P01  | Install whitelisted plugin                     | `cli.integration.test.ts`    | ✅     |
| TC-020-P04  | Plugin on whitelist with version constraint    | `cli.integration.test.ts`    | ✅     |
| TC-020-P05  | Plugin whitelist defined in devops-config.json | `policy.integration.test.ts` | ✅     |
| TC-020-N01  | Attempt to install non-whitelisted plugin      | `cli.integration.test.ts`    | ✅     |
| TC-020-N06  | Plugin version outside allowed SemVer range    | `cli.integration.test.ts`    | ✅     |
| TC-020-N07  | Whitelist config syntax error                  | `policy.integration.test.ts` | ✅     |

### BR-006: Contract Normalization

| RTM Test ID | Description                                  | Test File          | Status |
| ----------- | -------------------------------------------- | ------------------ | ------ |
| TC-006-P01  | Native adapter generates valid v1.0 contract | `contract.test.ts` | ✅     |
| TC-006-P03  | Contract includes full audit trail           | `contract.test.ts` | ✅     |
| TC-006-N01  | Adapter writes malformed JSON                | `contract.test.ts` | ✅     |
| TC-006-N02  | Required field missing from contract         | `contract.test.ts` | ✅     |

---

## E2E Workflow Coverage

The following RTM test cases are verified through GitHub Actions E2E workflows:

### verify-primitives.yml

- TC-001-P01, TC-001-P02: Policy loading with GitHub floor
- TC-006-P01: Contract schema validation
- TC-009-P01: CLI installation

### verify-governance.yml

- TC-007-P02: Freeze window enforcement
- TC-020-P01: Plugin whitelist enforcement

### plugin-whitelist-test.yml

- TC-020-P01, TC-020-P04: Whitelisted plugin installation
- TC-020-N01: Non-whitelisted plugin rejection

### verify-auth-contract.yml

- TC-011-P01: JWT authentication (with skip_auth for testing)

### integration-tests.yml

- All unit and integration tests in Jest

---

## Not Yet Implemented (Future Work)

| Business Process                 | RTM IDs                  | Notes                                |
| -------------------------------- | ------------------------ | ------------------------------------ |
| BR-003: Static Analysis          | TC-003-P01 to TC-003-N05 | Scanner not implemented              |
| BR-004: Check-Only Deployment    | TC-004-P01 to TC-004-N04 | Requires real Salesforce org         |
| BR-008: Quick Deploy             | TC-008-P01 to TC-008-N04 | Requires real Salesforce org         |
| BR-012: Break-Glass              | TC-012-P01 to TC-012-N03 | Emergency override not implemented   |
| BR-013: Notifications            | TC-013-P01 to TC-013-N04 | Slack/webhooks not implemented       |
| BR-021: Plugin Security Scanning | TC-021-P01 to TC-021-N05 | CVE scanning not implemented         |
| BR-023: Plugin Capabilities      | TC-023-P01 to TC-023-N04 | Sandbox restrictions not implemented |

---

## Coverage Summary

| Category              | Total RTM Cases | Implemented | Coverage |
| --------------------- | --------------- | ----------- | -------- |
| Policy & Governance   | 18              | 12          | 67%      |
| Plugin Whitelist      | 15              | 10          | 67%      |
| Authentication        | 7               | 4           | 57%      |
| Contract Generation   | 7               | 5           | 71%      |
| CLI/Adapter           | 7               | 5           | 71%      |
| **Implemented Total** | **54**          | **36**      | **67%**  |

> Note: Remaining 33% are future features (scanner, notifications, security scanning) not yet in scope for MVP.
