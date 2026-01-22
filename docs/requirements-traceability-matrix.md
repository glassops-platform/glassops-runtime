# GlassOps Requirements Traceability Matrix (RTM) - Updated

## Business Process to Test Case Mapping with Plugin Whitelist Support

This RTM maps GlassOps business processes to testable scenarios, including both positive and negative test cases to ensure comprehensive validation of the governance protocol.

## 1. Policy Resolution & Enforcement

**Business Process: BR-001 - Additive Policy Merge**  
_Description: System must merge policy from multiple sources using highest-value-wins logic while respecting GitHub floor_

| Test ID    | Test Case                                     | Type     | Expected Result                              | Trace To                                                                               |
| ---------- | --------------------------------------------- | -------- | -------------------------------------------- | -------------------------------------------------------------------------------------- |
| TC-001-P01 | GitHub floor 75%, config 80%, CMDT 90%        | Positive | Effective policy = 90%                       | [policy-engine-schema.md](policy-engine-schema.md), [architecture.md](architecture.md) |
| TC-001-P02 | GitHub floor 75%, config 80%, no CMDT         | Positive | Effective policy = 80%                       | [architecture.md §11](architecture.md#section-11)                                      |
| TC-001-P03 | GitHub floor 75%, config 85%, CMDT read fails | Positive | Effective policy = 85%, deployment continues | [architecture.md §11](architecture.md#section-11)                                      |
| TC-001-N01 | Config attempts 50% when GitHub floor is 75%  | Negative | Validation error, deployment blocked         | [architecture.md §11](architecture.md#section-11)                                      |
| TC-001-N02 | CMDT attempts 60% when GitHub floor is 75%    | Negative | CMDT value ignored, floor enforced           | [architecture.md §11](architecture.md#section-11)                                      |
| TC-001-N03 | All policy sources unavailable                | Negative | Use GitHub floor as fallback                 | [architecture.md §14](architecture.md#section-14)                                      |
| TC-001-N04 | Malformed policy.json syntax                  | Negative | Parse error with actionable message          | [troubleshooting.md](troubleshooting.md)                                               |

**Business Process: BR-002 - Policy Source Precedence**  
_Description: System must validate policy source hierarchy and prevent unauthorized lowering of standards_

| Test ID    | Test Case                                    | Type     | Expected Result                       | Trace To                                        |
| ---------- | -------------------------------------------- | -------- | ------------------------------------- | ----------------------------------------------- |
| TC-002-P01 | External API provides 95%, overrides all     | Positive | Effective policy = 95%                | [architecture.md §5](architecture.md#section-5) |
| TC-002-P02 | Manual override with justification logged    | Positive | Override applied, audit trail created | [architecture.md §5](architecture.md#section-5) |
| TC-002-N01 | Manual override without justification        | Negative | Override rejected                     | [architecture.md §5](architecture.md#section-5) |
| TC-002-N02 | Policy file version mismatch (future schema) | Negative | Graceful degradation with warning     | [platform-reference.md](platform-reference.md)  |
| TC-002-N03 | Circular policy reference detected           | Negative | Error with cycle path identified      | N/A - Edge case                                 |

## 2. Architectural Validation (Scanner Phase)

**Business Process: BR-003 - Static Analysis Invariants**  
_Description: Enforce architectural hard limits before deployment simulation_

| Test ID    | Test Case                                | Type     | Expected Result                                | Trace To                                                                                          |
| ---------- | ---------------------------------------- | -------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| TC-003-P01 | Code has 1 trigger per object            | Positive | Validation passes                              | [architecture.md §1.5](architecture.md#section-1-5), [executive-summary.md](executive-summary.md) |
| TC-003-P02 | Code has no SOQL in loops                | Positive | Validation passes                              | [architecture.md §1.5](architecture.md#section-1-5)                                               |
| TC-003-P03 | PMD scanner reports clean code           | Positive | Proceed to simulation phase                    | [architecture.md §1.5](architecture.md#section-1-5)                                               |
| TC-003-N01 | Code has 3 triggers on Opportunity       | Negative | Deployment blocked with specific error         | [executive-summary.md](executive-summary.md)                                                      |
| TC-003-N02 | SOQL query detected inside for-loop      | Negative | Deployment blocked with line number            | [executive-summary.md](executive-summary.md)                                                      |
| TC-003-N03 | RunAllTests attempted in production      | Negative | Deployment blocked                             | [architecture.md §1.5](architecture.md#section-1-5)                                               |
| TC-003-N04 | Scanner executable not found             | Negative | Graceful failure with install instructions     | [troubleshooting.md](troubleshooting.md)                                                          |
| TC-003-N05 | AI-generated code violates trigger limit | Negative | Block with "AI hallucination detected" message | [executive-summary.md §AI](executive-summary.md#ai)                                               |

## 3. Deployment Simulation & Validation

**Business Process: BR-004 - Check-Only Deployment**  
_Description: Simulate deployment without modifying target org_

| Test ID    | Test Case                                         | Type     | Expected Result                           | Trace To                                                    |
| ---------- | ------------------------------------------------- | -------- | ----------------------------------------- | ----------------------------------------------------------- |
| TC-004-P01 | Valid code, 85% coverage, check-only succeeds     | Positive | Draft contract generated                  | [architecture.md §2](architecture.md#section-2)             |
| TC-004-P02 | Delta deployment identifies 12 changed components | Positive | Only delta validated                      | [platform-reference.md](platform-reference.md)              |
| TC-004-P03 | Native adapter completes check-only in <5 min     | Positive | Performance benchmark met                 | [architecture.md §8](architecture.md#section-8)             |
| TC-004-N01 | Compilation error in Apex class                   | Negative | Contract shows error, deployment blocked  | [platform-reference.md §6](platform-reference.md#section-6) |
| TC-004-N02 | Missing dependent metadata                        | Negative | Dependency error logged in contract       | [platform-reference.md §6](platform-reference.md#section-6) |
| TC-004-N03 | Org connection timeout during check-only          | Negative | Retry logic invoked, then fail gracefully | [troubleshooting.md](troubleshooting.md)                    |
| TC-004-N04 | Check-only returns 0 components (empty delta)     | Negative | Warning issued, deployment skipped        | [platform-reference.md](platform-reference.md)              |

**Business Process: BR-005 - Coverage Enforcement**  
_Description: Validate test coverage meets effective policy requirements_

| Test ID    | Test Case                                        | Type     | Expected Result                         | Trace To                                                    |
| ---------- | ------------------------------------------------ | -------- | --------------------------------------- | ----------------------------------------------------------- |
| TC-005-P01 | Actual coverage 90%, required 75%                | Positive | Gate passes                             | [architecture.md §3](architecture.md#section-3)             |
| TC-005-P02 | Package coverage 87%, org-wide 85%, required 80% | Positive | Both thresholds met, gate passes        | [platform-reference.md §6](platform-reference.md#section-6) |
| TC-005-N01 | Actual coverage 70%, required 75%                | Negative | Deployment blocked with coverage report | [architecture.md §3](architecture.md#section-3)             |
| TC-005-N02 | Test classes compile but all fail                | Negative | 0% coverage, deployment blocked         | [architecture.md §3](architecture.md#section-3)             |
| TC-005-N03 | Coverage calculation service unavailable         | Negative | Fail-safe blocks deployment             | [architecture.md §14](architecture.md#section-14)           |
| TC-005-N04 | Coverage reported as NaN or null                 | Negative | Treat as 0%, block deployment           | [platform-reference.md §6](platform-reference.md#section-6) |

## 4. Deployment Contract Generation

**Business Process: BR-006 - Contract Normalization**  
_Description: Adapters must produce valid, schema-compliant deployment contracts_

| Test ID    | Test Case                                    | Type     | Expected Result                                 | Trace To                                                    |
| ---------- | -------------------------------------------- | -------- | ----------------------------------------------- | ----------------------------------------------------------- |
| TC-006-P01 | Native adapter generates valid v1.0 contract | Positive | Schema validation passes                        | [platform-reference.md §6](platform-reference.md#section-6) |
| TC-006-P02 | Hardis adapter generates identical schema    | Positive | Both adapters produce compatible output         | [architecture.md §8](architecture.md#section-8)             |
| TC-006-P03 | Contract includes full audit trail           | Positive | triggeredBy, commit, runUrl present             | [platform-reference.md §6](platform-reference.md#section-6) |
| TC-006-N01 | Adapter writes malformed JSON                | Negative | Governance layer rejects with parse error       | [architecture.md §10](architecture.md#section-10)           |
| TC-006-N02 | Required field missing from contract         | Negative | Schema validation fails                         | [platform-reference.md §6](platform-reference.md#section-6) |
| TC-006-N03 | Adapter crashes mid-execution                | Negative | Partial file cleaned up, error contract written | [architecture.md §10](architecture.md#section-10)           |
| TC-006-N04 | Contract file permissions deny read access   | Negative | Permission error with remediation steps         | [troubleshooting.md](troubleshooting.md)                    |

## 5. Governance Gate Decision

**Business Process: BR-007 - Pass/Fail Adjudication**  
_Description: Compare draft contract against effective policy to determine deployment eligibility_

| Test ID    | Test Case                                    | Type     | Expected Result                             | Trace To                                            |
| ---------- | -------------------------------------------- | -------- | ------------------------------------------- | --------------------------------------------------- |
| TC-007-P01 | All criteria met, gate approves quick deploy | Positive | Phase 4 execution triggered                 | [architecture.md §3](architecture.md#section-3)     |
| TC-007-P02 | Production freeze window, deployment queued  | Positive | Deployment deferred with notification       | [notifications.md](notifications.md)                |
| TC-007-N01 | Coverage below threshold                     | Negative | Gate blocks, error details in artifact      | [architecture.md §3](architecture.md#section-3)     |
| TC-007-N02 | Invariant violation from scanner             | Negative | Gate blocks, scanner report attached        | [architecture.md §1.5](architecture.md#section-1-5) |
| TC-007-N03 | JIRA ticket required but missing             | Negative | Gate blocks with ticket requirement message | [platform-reference.md](platform-reference.md)      |
| TC-007-N04 | Multiple violations (coverage + tests)       | Negative | All violations listed in single error       | [troubleshooting.md](troubleshooting.md)            |

## 6. Quick Deploy Execution

**Business Process: BR-008 - Validation ID Reuse**  
_Description: Use validation ID from check-only to deploy exact validated code_

| Test ID    | Test Case                                         | Type     | Expected Result                        | Trace To                                          |
| ---------- | ------------------------------------------------- | -------- | -------------------------------------- | ------------------------------------------------- |
| TC-008-P01 | Valid validation ID, quick deploy succeeds        | Positive | Final contract with deployment ID      | [architecture.md §4](architecture.md#section-4)   |
| TC-008-P02 | 42 components deployed in <2 min via quick deploy | Positive | Performance benefit confirmed          | [architecture.md §4](architecture.md#section-4)   |
| TC-008-N01 | Validation ID expired (>10 days old)              | Negative | Fallback to full validation + deploy   | [architecture.md §4](architecture.md#section-4)   |
| TC-008-N02 | Validation ID from different org                  | Negative | Invalid ID error, deployment blocked   | [platform-reference.md](platform-reference.md)    |
| TC-008-N03 | Network failure during quick deploy               | Negative | Rollback, final contract shows failure | [architecture.md §14](architecture.md#section-14) |
| TC-008-N04 | Salesforce service degradation during deploy      | Negative | Timeout, retry logic, eventual failure | [architecture.md §14](architecture.md#section-14) |

## 7. Adapter Interface Compliance

**Business Process: BR-009 - Adapter Contract Requirements**  
_Description: All adapters must implement required interface methods_

| Test ID    | Test Case                                      | Type     | Expected Result                         | Trace To                                          |
| ---------- | ---------------------------------------------- | -------- | --------------------------------------- | ------------------------------------------------- |
| TC-009-P01 | Custom adapter implements all required methods | Positive | Adapter accepted by governance layer    | [architecture.md §10](architecture.md#section-10) |
| TC-009-P02 | Adapter emits valid JSON even on tool crash    | Positive | Error contract generated                | [architecture.md §10](architecture.md#section-10) |
| TC-009-P03 | Adapter calculates coverage correctly          | Positive | Values match Salesforce UI              | [architecture.md §10](architecture.md#section-10) |
| TC-009-N01 | Adapter missing calculateCoverage() method     | Negative | Adapter initialization fails            | [architecture.md §10](architecture.md#section-10) |
| TC-009-N02 | Adapter returns non-JSON output                | Negative | Parsing error, deployment blocked       | [architecture.md §10](architecture.md#section-10) |
| TC-009-N03 | Adapter timeout exceeds 30 minutes             | Negative | Kill process, generate timeout contract | [troubleshooting.md](troubleshooting.md)          |
| TC-009-N04 | Adapter uses localStorage (unsupported API)    | Negative | Runtime error with clear message        | artifacts_info in prompt                          |

## 8. Engine Switching

**Business Process: BR-010 - Runtime Engine Selection**  
_Description: Allow switching between execution engines without breaking governance_

| Test ID    | Test Case                                      | Type     | Expected Result                                  | Trace To                                                    |
| ---------- | ---------------------------------------------- | -------- | ------------------------------------------------ | ----------------------------------------------------------- |
| TC-010-P01 | Switch from native to hardis in config         | Positive | Hardis adapter used, policy unchanged            | [architecture.md §9](architecture.md#section-9)             |
| TC-010-P02 | Fallback to native when hardis unavailable     | Positive | Native adapter executes successfully             | [platform-reference.md §5](platform-reference.md#section-5) |
| TC-010-P03 | Both engines produce identical contract schema | Positive | Governance layer agnostic to engine              | [architecture.md §8](architecture.md#section-8)             |
| TC-010-N01 | Invalid engine name in config                  | Negative | Config validation error with valid options       | [platform-reference.md §5](platform-reference.md#section-5) |
| TC-010-N02 | Both primary and fallback engines fail         | Negative | Deployment aborted with diagnostic info          | [platform-reference.md §5](platform-reference.md#section-5) |
| TC-010-N03 | Engine switch mid-deployment                   | Negative | Use engine from policy snapshot, not live config | [architecture.md §5](architecture.md#section-5)             |

## 9. Authentication & Secrets Management

**Business Process: BR-011 - JWT Authentication Flow**  
_Description: Authenticate to Salesforce using GitHub-stored JWT credentials_

| Test ID    | Test Case                                | Type     | Expected Result                                  | Trace To                                          |
| ---------- | ---------------------------------------- | -------- | ------------------------------------------------ | ------------------------------------------------- |
| TC-011-P01 | Valid JWT key, auth succeeds             | Positive | Org connection established                       | [architecture.md §12](architecture.md#section-12) |
| TC-011-P02 | IP restriction enforced on Connected App | Positive | Auth rejected from unauthorized IP               | [architecture.md §12](architecture.md#section-12) |
| TC-011-P03 | JWT key rotation after 90 days           | Positive | New key works, old key revoked                   | [architecture.md §12](architecture.md#section-12) |
| TC-011-N01 | Invalid client ID                        | Negative | Auth error with credential check steps           | [troubleshooting.md](troubleshooting.md)          |
| TC-011-N02 | JWT key format corrupted                 | Negative | Parse error with key regeneration instructions   | [troubleshooting.md](troubleshooting.md)          |
| TC-011-N03 | Attempt to store JWT in Salesforce CMDT  | Negative | Design-level rejection (architectural violation) | [architecture.md §12](architecture.md#section-12) |
| TC-011-N04 | Session timeout during deployment        | Negative | Re-auth automatically, deployment continues      | [architecture.md §12](architecture.md#section-12) |

## 10. Break-Glass Emergency Override

**Business Process: BR-012 - Emergency Deployment Bypass**  
_Description: Allow critical production fixes while maintaining audit trail_

| Test ID    | Test Case                                  | Type     | Expected Result                          | Trace To                                                              |
| ---------- | ------------------------------------------ | -------- | ---------------------------------------- | --------------------------------------------------------------------- |
| TC-012-P01 | Manual override with incident ticket       | Positive | All checks bypassed, deployment proceeds | [architecture.md Appendix A §3](architecture.md#appendix-a-section-3) |
| TC-012-P02 | Break-glass event logged in audit trail    | Positive | Override reason and approver captured    | [architecture.md Appendix A §3](architecture.md#appendix-a-section-3) |
| TC-012-P03 | Direct CLI deployment during GitHub outage | Positive | Recovery completed in <15 min            | [architecture.md §16](architecture.md#section-16)                     |
| TC-012-N01 | Override attempt without justification     | Negative | Override rejected, normal flow required  | [architecture.md §5](architecture.md#section-5)                       |
| TC-012-N02 | Non-authorized user attempts override      | Negative | Permission denied error                  | [architecture.md §12](architecture.md#section-12)                     |
| TC-012-N03 | Override used outside incident window      | Negative | Additional approval required             | [platform-reference.md](platform-reference.md)                        |

## 11. Observability & Notifications

**Business Process: BR-013 - Event Stream & Alerts**  
_Description: Emit deployment events and notify stakeholders_

| Test ID    | Test Case                                      | Type     | Expected Result                                | Trace To                                        |
| ---------- | ---------------------------------------------- | -------- | ---------------------------------------------- | ----------------------------------------------- |
| TC-013-P01 | Deployment success, Slack notification sent    | Positive | Message delivered within 30s                   | [notifications.md](notifications.md)            |
| TC-013-P02 | Governance failure, @channel mention triggered | Positive | Alert includes failure details and log link    | [notifications.md](notifications.md)            |
| TC-013-P03 | Platform event published to Salesforce         | Positive | Event consumable by external systems           | [architecture.md §6](architecture.md#section-6) |
| TC-013-N01 | Webhook URL invalid                            | Negative | Notification fails, deployment continues       | [notifications.md](notifications.md)            |
| TC-013-N02 | Notification disabled for sandbox env          | Negative | No message sent, deployment completes silently | [notifications.md](notifications.md)            |
| TC-013-N03 | Webhook service timeout                        | Negative | Log warning, don't block deployment            | [notifications.md](notifications.md)            |
| TC-013-N04 | Malformed event payload                        | Negative | Schema validation error logged                 | [architecture.md §6](architecture.md#section-6) |

## 12. Multi-Environment Configuration

**Business Process: BR-014 - Environment-Specific Policy**  
_Description: Apply different policies to dev, UAT, and production environments_

| Test ID    | Test Case                                    | Type     | Expected Result                           | Trace To                                                    |
| ---------- | -------------------------------------------- | -------- | ----------------------------------------- | ----------------------------------------------------------- |
| TC-014-P01 | Dev requires 75%, prod requires 90%          | Positive | Each env enforces correct threshold       | [platform-reference.md §5](platform-reference.md#section-5) |
| TC-014-P02 | Sandbox notifications disabled, prod enabled | Positive | Noise reduction in non-critical envs      | [notifications.md](notifications.md)                        |
| TC-014-P03 | Environment detected from org type           | Positive | Production flag triggers safety gates     | [platform-reference.md §2](platform-reference.md#section-2) |
| TC-014-N01 | Org alias not found in devops-config.json    | Negative | Environment detection fails with guidance | [platform-reference.md §5](platform-reference.md#section-5) |
| TC-014-N02 | Conflicting env config (prod + dev settings) | Negative | Validation error, deployment blocked      | [platform-reference.md §5](platform-reference.md#section-5) |
| TC-014-N03 | Unknown environment type                     | Negative | Default to strictest policy (production)  | [platform-reference.md §5](platform-reference.md#section-5) |

## 13. Failure Recovery & Resilience

**Business Process: BR-015 - Graceful Degradation**  
_Description: System must handle partial failures without catastrophic collapse_

| Test ID    | Test Case                                          | Type     | Expected Result                       | Trace To                                          |
| ---------- | -------------------------------------------------- | -------- | ------------------------------------- | ------------------------------------------------- |
| TC-015-P01 | CMDT read fails, use config file policy            | Positive | Deployment continues with fallback    | [architecture.md §11](architecture.md#section-11) |
| TC-015-P02 | External policy API unavailable                    | Positive | Use cached policy snapshot            | [architecture.md §5](architecture.md#section-5)   |
| TC-015-P03 | Platform event publish fails                       | Positive | Log error, deployment succeeds        | [architecture.md §14](architecture.md#section-14) |
| TC-015-N01 | All policy sources fail                            | Negative | Use GitHub floor as last resort       | [architecture.md §14](architecture.md#section-14) |
| TC-015-N02 | GitHub Actions service outage                      | Negative | Manual deployment via CLI documented  | [architecture.md §16](architecture.md#section-16) |
| TC-015-N03 | Salesforce org completely unreachable              | Negative | Deployment aborted immediately        | [architecture.md §14](architecture.md#section-14) |
| TC-015-N04 | Partial metadata deployment (some components fail) | Negative | Rollback all changes, report failures | [platform-reference.md](platform-reference.md)    |

## 14. Delta Deployment Logic

**Business Process: BR-016 - Changed Component Detection**  
_Description: Deploy only components modified between commits_

| Test ID    | Test Case                                      | Type     | Expected Result                            | Trace To                                                    |
| ---------- | ---------------------------------------------- | -------- | ------------------------------------------ | ----------------------------------------------------------- |
| TC-016-P01 | Detect 12 changed components from git diff     | Positive | Only delta validated and deployed          | [platform-reference.md §4](platform-reference.md#section-4) |
| TC-016-P02 | Full deployment when base_ref not found        | Positive | Fallback to full source deployment         | [platform-reference.md §4](platform-reference.md#section-4) |
| TC-016-P03 | sfdx-git-delta generates package.xml correctly | Positive | Delta matches manual git diff              | [platform-reference.md §4](platform-reference.md#section-4) |
| TC-016-N01 | Empty delta (no changes detected)              | Negative | Skip deployment with info message          | [architecture.md §2](architecture.md#section-2)             |
| TC-016-N02 | Git history unavailable (shallow clone)        | Negative | Fallback to full deployment with warning   | [troubleshooting.md](troubleshooting.md)                    |
| TC-016-N03 | Binary file corruption in delta                | Negative | Deployment fails with corrupted file error | [platform-reference.md](platform-reference.md)              |

## 15. AI Safety Integration

**Business Process: BR-017 - AI-Generated Code Validation**  
_Description: Detect and block AI hallucinations before deployment_

| Test ID    | Test Case                                  | Type     | Expected Result                           | Trace To                                            |
| ---------- | ------------------------------------------ | -------- | ----------------------------------------- | --------------------------------------------------- |
| TC-017-P01 | AI code passes all invariants              | Positive | Deployment proceeds normally              | [executive-summary.md §AI](executive-summary.md#ai) |
| TC-017-P02 | Copilot-generated code meets coverage      | Positive | No special handling needed                | [executive-summary.md §AI](executive-summary.md#ai) |
| TC-017-N01 | AI generates SOQL in loop                  | Negative | Scanner blocks with "AI pattern detected" | [executive-summary.md §AI](executive-summary.md#ai) |
| TC-017-N02 | AI creates 3 triggers on Account           | Negative | Invariant violation, deployment blocked   | [executive-summary.md §AI](executive-summary.md#ai) |
| TC-017-N03 | AI-generated test class has 0% coverage    | Negative | Coverage gate blocks deployment           | [executive-summary.md §AI](executive-summary.md#ai) |
| TC-017-N04 | AI bypasses test class generation entirely | Negative | Required test enforcement blocks          | [executive-summary.md §AI](executive-summary.md#ai) |

## 16. Plugin Whitelist Management

**Business Process: BR-020 - Whitelistable Plugin System**  
_Description: Control which Salesforce CLI plugins are permitted in GlassOps workflows_

| Test ID    | Test Case                                             | Type     | Expected Result                              | Trace To                                                    |
| ---------- | ----------------------------------------------------- | -------- | -------------------------------------------- | ----------------------------------------------------------- |
| TC-020-P01 | Install whitelisted plugin (sfdx-git-delta)           | Positive | Plugin installs and executes successfully    | [platform-reference.md §7](platform-reference.md#section-7) |
| TC-020-P02 | Install whitelisted plugin (sfdx-hardis)              | Positive | Plugin installs and executes successfully    | [architecture.md §8](architecture.md#section-8)             |
| TC-020-P03 | Verify plugin signature before installation           | Positive | Signature validation passes                  | New requirement                                             |
| TC-020-P04 | Plugin on whitelist with version constraint           | Positive | Only approved version installs               | New requirement                                             |
| TC-020-P05 | Plugin whitelist defined in devops-config.json        | Positive | Config-driven plugin management              | New requirement                                             |
| TC-020-P06 | Plugin whitelist inheritance (base + org-specific)    | Positive | Merged whitelist applied correctly           | New requirement                                             |
| TC-020-P07 | Auto-update whitelisted plugin within SemVer range    | Positive | Plugin updates to latest patch version       | New requirement                                             |
| TC-020-N01 | Attempt to install non-whitelisted plugin             | Negative | Installation blocked with explanation        | New requirement                                             |
| TC-020-N02 | Attempt to install plugin with CVE vulnerability      | Negative | Security scan blocks installation            | New requirement                                             |
| TC-020-N03 | Malicious plugin with valid signature                 | Negative | Behavioral analysis blocks execution         | New requirement                                             |
| TC-020-N04 | Plugin requests network access to non-approved domain | Negative | Network policy blocks connection             | New requirement                                             |
| TC-020-N05 | Plugin attempts to modify .git directory              | Negative | File system policy blocks modification       | New requirement                                             |
| TC-020-N06 | Plugin version outside allowed SemVer range           | Negative | Version constraint violation error           | New requirement                                             |
| TC-020-N07 | Whitelist config syntax error                         | Negative | Config validation fails with helpful message | New requirement                                             |
| TC-020-N08 | Plugin attempts to execute arbitrary shell commands   | Negative | Sandbox violation blocks execution           | New requirement                                             |

**Business Process: BR-021 - Plugin Security Scanning**  
_Description: Automated security validation for all CLI plugins before execution_

| Test ID    | Test Case                                    | Type     | Expected Result                             | Trace To        |
| ---------- | -------------------------------------------- | -------- | ------------------------------------------- | --------------- |
| TC-021-P01 | Scan plugin for known CVEs before install    | Positive | Clean scan, plugin approved                 | New requirement |
| TC-021-P02 | Verify plugin npm package integrity          | Positive | Checksum matches expected value             | New requirement |
| TC-021-P03 | Scan plugin dependencies for vulnerabilities | Positive | All dependencies pass security scan         | New requirement |
| TC-021-P04 | Plugin security scan cached for performance  | Positive | Subsequent installs use cached results      | New requirement |
| TC-021-N01 | Plugin has critical CVE (CVSS 9.0+)          | Negative | Installation blocked, alternative suggested | New requirement |
| TC-021-N02 | Plugin dependency has moderate CVE           | Negative | Warning issued, requires explicit approval  | New requirement |
| TC-021-N03 | Plugin checksum mismatch                     | Negative | Tampering detected, installation aborted    | New requirement |
| TC-021-N04 | Plugin requires unsafe Node.js permissions   | Negative | Permission analysis blocks installation     | New requirement |
| TC-021-N05 | Security scanner service unavailable         | Negative | Fail-safe blocks installation               | New requirement |

**Business Process: BR-022 - Plugin Audit Trail**  
_Description: Complete audit logging of plugin installations and executions_

| Test ID    | Test Case                                         | Type     | Expected Result                                | Trace To        |
| ---------- | ------------------------------------------------- | -------- | ---------------------------------------------- | --------------- |
| TC-022-P01 | Log plugin installation with version              | Positive | Audit record includes timestamp, user, version | New requirement |
| TC-022-P02 | Log plugin execution in deployment contract       | Positive | Contract shows which plugins were used         | New requirement |
| TC-022-P03 | Query all plugin installations in last 90 days    | Positive | Complete audit trail retrieved                 | New requirement |
| TC-022-P04 | Alert on unauthorized plugin installation attempt | Positive | Security team notified immediately             | New requirement |
| TC-022-N01 | Audit log write fails                             | Negative | Deployment blocked until audit confirmed       | New requirement |
| TC-022-N02 | Attempt to tamper with plugin audit log           | Negative | Immutability check detects modification        | New requirement |

**Business Process: BR-023 - Plugin Capability Restrictions**  
_Description: Enforce fine-grained capability controls on plugin behavior_

| Test ID    | Test Case                                          | Type     | Expected Result                            | Trace To        |
| ---------- | -------------------------------------------------- | -------- | ------------------------------------------ | --------------- |
| TC-023-P01 | Plugin with file system read-only access           | Positive | Plugin reads metadata, cannot write        | New requirement |
| TC-023-P02 | Plugin with network access to Salesforce APIs only | Positive | HTTPS to \*.salesforce.com allowed         | New requirement |
| TC-023-P03 | Plugin capability inheritance from base policy     | Positive | Org-specific capabilities merge with base  | New requirement |
| TC-023-N01 | Plugin attempts file write without permission      | Negative | Capability violation blocks operation      | New requirement |
| TC-023-N02 | Plugin attempts network call to unknown domain     | Negative | Network policy blocks connection           | New requirement |
| TC-023-N03 | Plugin attempts process spawning                   | Negative | Process spawn blocked (unless whitelisted) | New requirement |
| TC-023-N04 | Plugin attempts environment variable modification  | Negative | Sandbox violation blocks operation         | New requirement |

## Configuration Schema Extension

### Plugin Whitelist Configuration (devops-config.json)

```json
{
  "plugins": {
    "whitelist": {
      "enabled": true,
      "enforcement": "strict",
      "sources": [
        {
          "name": "sfdx-git-delta",
          "version": "^5.0.0",
          "registry": "npm",
          "required": true,
          "capabilities": ["file:read", "git:read"],
          "securityScan": true
        },
        {
          "name": "sfdx-hardis",
          "version": ">=4.0.0 <5.0.0",
          "registry": "npm",
          "required": false,
          "capabilities": ["file:read", "file:write", "network:salesforce"],
          "securityScan": true,
          "allowedDomains": ["*.salesforce.com", "*.force.com"]
        },
        {
          "name": "@salesforce/plugin-analytics",
          "version": "*",
          "registry": "npm",
          "required": false,
          "capabilities": ["file:read", "network:salesforce"],
          "securityScan": true
        }
      ],
      "security": {
        "scanOnInstall": true,
        "scanOnUpdate": true,
        "blockCriticalCVE": true,
        "warnModerateCVE": true,
        "verifySignatures": true,
        "checksumValidation": true,
        "maxDependencyDepth": 5
      },
      "capabilities": {
        "file": {
          "read": ["force-app/**", ".sfdx/**", "sfdx-project.json"],
          "write": [".glassops/**", "changed-sources/**"],
          "blocked": [".git/**", ".github/**", "**/.env"]
        },
        "network": {
          "allowed": ["*.salesforce.com", "*.force.com"],
          "blocked": ["*"],
          "requireHTTPS": true
        },
        "process": {
          "spawn": false,
          "exec": false
        },
        "env": {
          "read": ["SF_*", "SFDX_*", "GLASSOPS_*"],
          "write": []
        }
      },
      "audit": {
        "logInstallation": true,
        "logExecution": true,
        "logSecurityEvents": true,
        "immutableLog": true,
        "alertOnViolation": true,
        "alertChannel": "slack"
      }
    }
  }
}
```

### Plugin Whitelist Policy Resolution

**Policy Merge Algorithm Extension**

```javascript
// Extend existing policy resolution
const effectivePluginPolicy = {
  whitelist: mergePluginWhitelists([
    githubBasePlugins,      // Absolute floor (required plugins)
    policyFilePlugins,      // Team standard plugins
    orgOverlayPlugins,      // Org-specific additions
    cmdt PluginPolicy        // Optional Salesforce-managed additions
  ]),
  capabilities: mergeCapabilities([
    githubBaseCapabilities, // Absolute restrictions
    policyFileCapabilities, // Team refinements (can only restrict further)
    orgOverlayCapabilities  // Org-specific refinements
  ]),
  security: mergeSecurityPolicy([
    githubBaseSecurity,     // Absolute floor (cannot be weakened)
    policyFileSecurity,     // Team additions
    orgOverlaySecurity      // Org additions
  ])
};

// Validation rules:
// 1. Plugin whitelist is ADDITIVE ONLY (can add, cannot remove required plugins)
// 2. Capabilities are RESTRICTIVE ONLY (can narrow, cannot expand)
// 3. Security controls are ADDITIVE ONLY (can add checks, cannot remove)
```

### Deployment Contract Extension

**Plugin Metadata in Contract**

```json
{
  "schemaVersion": "1.0",
  "meta": {
    "engine": "native",
    "engineVersion": "2.30.8",
    "timestamp": "2026-01-19T10:00:00Z",
    "plugins": [
      {
        "name": "sfdx-git-delta",
        "version": "5.2.1",
        "whitelisted": true,
        "securityScan": {
          "timestamp": "2026-01-19T09:45:00Z",
          "status": "passed",
          "vulnerabilities": []
        },
        "capabilities": ["file:read", "git:read"],
        "executionTime": 1.23
      },
      {
        "name": "sfdx-hardis",
        "version": "4.17.0",
        "whitelisted": true,
        "securityScan": {
          "timestamp": "2026-01-19T09:45:00Z",
          "status": "passed",
          "vulnerabilities": []
        },
        "capabilities": ["file:read", "file:write", "network:salesforce"],
        "executionTime": 45.67
      }
    ]
  },
  "status": "Succeeded"
  // ... rest of contract
}
```

## Cross-Cutting Concerns

**Business Process: BR-018 - Audit Trail Completeness**  
_Description: Every deployment must produce complete, queryable audit record_

| Test ID    | Test Case                                  | Type     | Expected Result                                  | Trace To                                                     |
| ---------- | ------------------------------------------ | -------- | ------------------------------------------------ | ------------------------------------------------------------ |
| TC-018-P01 | Query all deployments for last 2 years     | Positive | Complete history retrieved                       | [governance-without-lockin.md](governance-without-lockin.md) |
| TC-018-P02 | Contract includes git commit SHA           | Positive | Traceable to exact code version                  | [platform-reference.md §6](platform-reference.md#section-6)  |
| TC-018-P03 | Audit log includes triggeredBy email       | Positive | User accountability established                  | [platform-reference.md §6](platform-reference.md#section-6)  |
| TC-018-P04 | Audit trail includes plugin usage metadata | Positive | Which plugins were used in deployment            | New requirement                                              |
| TC-018-N01 | Audit data corrupted or missing            | Negative | Alert compliance team, block further deployments | [architecture.md §6](architecture.md#section-6)              |
| TC-018-N02 | Anonymous deployment attempt               | Negative | Require authenticated user, block deployment     | [architecture.md §12](architecture.md#section-12)            |
| TC-018-N03 | Plugin execution not logged in audit       | Negative | Audit gap detected, alert security team          | New requirement                                              |

## Performance & Scalability

**Business Process: BR-019 - Performance Benchmarks**  
_Description: Maintain acceptable deployment speed while enforcing governance_

| Test ID    | Test Case                                     | Type     | Expected Result                          | Trace To                                        |
| ---------- | --------------------------------------------- | -------- | ---------------------------------------- | ----------------------------------------------- |
| TC-019-P01 | Check-only completes in <5 minutes            | Positive | Performance target met                   | [architecture.md §8](architecture.md#section-8) |
| TC-019-P02 | Policy resolution completes in <30s           | Positive | No noticeable delay                      | [architecture.md §5](architecture.md#section-5) |
| TC-019-P03 | Quick deploy saves 15+ minutes vs full deploy | Positive | Efficiency gain validated                | [architecture.md §4](architecture.md#section-4) |
| TC-019-P04 | Plugin security scan cached for 24 hours      | Positive | Subsequent runs use cache                | New requirement                                 |
| TC-019-P05 | Plugin whitelist validation completes in <5s  | Positive | Minimal overhead from plugin checks      | New requirement                                 |
| TC-019-N01 | Policy resolution exceeds 2 minutes           | Negative | Timeout warning, investigate CMDT query  | [troubleshooting.md](troubleshooting.md)        |
| TC-019-N02 | Adapter hangs for 30+ minutes                 | Negative | Kill process, generate timeout contract  | [troubleshooting.md](troubleshooting.md)        |
| TC-019-N03 | Plugin security scan exceeds 60 seconds       | Negative | Scan timeout, use cached result or block | New requirement                                 |

## Test Coverage Summary (Updated)

| Category                 | Total Cases | Positive | Negative |
| ------------------------ | ----------- | -------- | -------- |
| Policy Resolution        | 11          | 6        | 5        |
| Architectural Validation | 8           | 3        | 5        |
| Deployment Simulation    | 8           | 4        | 4        |
| Contract Generation      | 7           | 3        | 4        |
| Governance Gate          | 7           | 2        | 5        |
| Quick Deploy             | 7           | 2        | 5        |
| Adapter Interface        | 7           | 3        | 4        |
| Engine Switching         | 6           | 3        | 3        |
| Authentication           | 7           | 3        | 4        |
| Break-Glass              | 6           | 3        | 3        |
| Observability            | 7           | 3        | 4        |
| Multi-Environment        | 6           | 3        | 3        |
| Failure Recovery         | 7           | 3        | 4        |
| Delta Deployment         | 6           | 3        | 3        |
| AI Safety                | 6           | 2        | 4        |
| Plugin Whitelist         | 15          | 7        | 8        |
| Plugin Security          | 9           | 4        | 5        |
| Plugin Audit             | 6           | 4        | 2        |
| Plugin Capabilities      | 7           | 3        | 4        |
| Audit Trail              | 7           | 4        | 3        |
| Performance              | 8           | 5        | 3        |
| **TOTAL**                | **161**     | **78**   | **83**   |

## Critical Path Test Scenarios (Updated)

### End-to-End Happy Path with Plugin Validation

TC-020-P01 (Install whitelisted plugin) → TC-021-P01 (Security scan) → TC-022-P01 (Audit log) → TC-001-P01 (Policy resolution) → TC-003-P01 (Scanner) → TC-004-P01 (Simulation) → TC-005-P01 (Coverage) → TC-007-P01 (Gate) → TC-008-P01 (Deploy) → TC-013-P01 (Notify)

### End-to-End Failure Path - Unauthorized Plugin

TC-020-N01 (Non-whitelisted plugin) → TC-022-P04 (Security alert) → Deployment blocked

### End-to-End Failure Path - Vulnerable Plugin

TC-020-P01 (Attempt install) → TC-021-N01 (CVE detected) → TC-022-P04 (Security alert) → Deployment blocked with alternative suggested

### End-to-End Failure Path - Plugin Capability Violation

TC-020-P01 (Plugin installed) → TC-023-N01 (Unauthorized file write) → TC-022-P04 (Alert) → Capability violation logged

## Testing Priorities (Updated)

### P0 (Must Pass Before Any Release)

- All authentication tests (BR-011)
- Policy resolution core logic (BR-001)
- Architectural invariants (BR-003)
- Contract schema validation (BR-006)
- Plugin whitelist enforcement (BR-020)
- Plugin security scanning (BR-021)

### P1 (Required for Production Use)

- Coverage enforcement (BR-005)
- Engine switching (BR-010)
- Break-glass flows (BR-012)
- Audit completeness (BR-018)
- Plugin capability restrictions (BR-023)
- Plugin audit trail (BR-022)

### P2 (Enhanced Features)

- AI safety integration (BR-017)
- Multi-environment config (BR-014)
- Performance benchmarks (BR-019)
- Plugin auto-updates within version constraints

## Security Considerations for Plugin System

### Threat Model

| Threat                                   | Mitigation                         | Test Coverage          |
| ---------------------------------------- | ---------------------------------- | ---------------------- |
| Malicious plugin installation            | Whitelist + signature verification | TC-020-N01, TC-021-P02 |
| Supply chain attack (compromised plugin) | Checksum validation + CVE scanning | TC-021-N03, TC-021-P01 |
| Plugin privilege escalation              | Capability sandbox enforcement     | TC-023-N01, TC-023-P01 |
| Data exfiltration via plugin             | Network policy restrictions        | TC-020-N04, TC-023-N02 |
| Plugin tampering with Git history        | File system access controls        | TC-020-N05             |
| Arbitrary code execution                 | Process spawning restrictions      | TC-020-N08, TC-023-N03 |
| CVE exploitation in dependencies         | Dependency scanning + depth limits | TC-021-P03, TC-021-N02 |
| Audit log tampering                      | Immutable audit trail              | TC-022-N02             |

## Compliance Mapping for Plugin System

| Compliance Framework | Requirement                   | GlassOps Control             | Test Coverage          |
| -------------------- | ----------------------------- | ---------------------------- | ---------------------- |
| SOC 2                | Change management audit trail | Plugin installation logging  | TC-022-P01, TC-022-P03 |
| ISO 27001            | Secure software supply chain  | Plugin security scanning     | TC-021-P01, TC-021-P03 |
| NIST CSF             | Vulnerability management      | CVE blocking                 | TC-021-N01, TC-021-N02 |
| PCI DSS              | Least privilege enforcement   | Capability restrictions      | TC-023-P01, TC-023-P02 |
| GDPR                 | Data protection controls      | Network access restrictions  | TC-023-P02, TC-020-N04 |
| HIPAA                | Audit logging                 | Immutable plugin audit trail | TC-022-P02, TC-022-N02 |
