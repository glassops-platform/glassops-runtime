# GlassOps Runtime™

[![Verify Primitives](https://github.com/glassops-platform/glassops-runtime/actions/workflows/verify-primitives.yml/badge.svg)](https://github.com/glassops-platform/glassops-runtime/actions/workflows/verify-primitives.yml)
[![Integration Tests](https://github.com/glassops-platform/glassops-runtime/actions/workflows/integration-tests.yml/badge.svg)](https://github.com/glassops-platform/glassops-runtime/actions/workflows/integration-tests.yml)
[![Verify Governance](https://github.com/glassops-platform/glassops-runtime/actions/workflows/verify-governance.yml/badge.svg)](https://github.com/glassops-platform/glassops-runtime/actions/workflows/verify-governance.yml)
[![Plugin Whitelist Tests](https://github.com/glassops-platform/glassops-runtime/actions/workflows/plugin-whitelist-test.yml/badge.svg)](https://github.com/glassops-platform/glassops-runtime/actions/workflows/plugin-whitelist-test.yml)
[![Verify Auth Contract](https://github.com/glassops-platform/glassops-runtime/actions/workflows/verify-auth-contract.yml/badge.svg)](https://github.com/glassops-platform/glassops-runtime/actions/workflows/verify-auth-contract.yml)

**The governance-first execution primitive for Salesforce DevOps.**

GlassOps Runtime is a specialized GitHub Action wrapper that provides a governed, secure, and observable execution environment for Salesforce CLI operations. It enforces policy _before_ execution, bootstraps the environment, manages identity securely, and emits a cryptographic deployment contract.

## 🚀 Quick Start

Use GlassOps Runtime in your GitHub Actions workflow to securely interact with Salesforce:

```yaml
steps:
  - name: Initialize GlassOps Runtime
    uses: glassops-platform/glassops-runtime@v1
    with:
      # Identity
      client_id: ${{ secrets.SF_CLIENT_ID }}
      jwt_key: ${{ secrets.SF_JWT_KEY }}
      username: ${{ vars.SF_USERNAME }}
      instance_url: https://login.salesforce.com

      # Governance
      enforce_policy: "true" # Enforce freeze windows & rules
```

## ⚙️ Configuration

GlassOps Runtime looks for a `devops-config.json` file in your repository root to define governance policies and runtime settings.

### Example `devops-config.json`

```json
{
  "governance": {
    "enabled": true,
    "freeze_windows": [
      {
        "day": "Friday",
        "start": "17:00",
        "end": "23:59"
      },
      {
        "day": "Saturday",
        "start": "00:00",
        "end": "23:59"
      },
      {
        "day": "Sunday",
        "start": "00:00",
        "end": "23:59"
      }
    ]
  },
  "runtime": {
    "cli_version": "latest",
    "node_version": "20"
  }
}
```

### Technical Specifications

| Requirement         | Specification                          |
| :------------------ | :------------------------------------- |
| **Node.js**         | v20+ (managed via `node_version`)      |
| **Salesforce CLI**  | `sf` (v2.x)                            |
| **Auth Method**     | JWT-OAuth 2.0 (Strict Identity)        |
| **Protocol Schema** | Zod-validated Deployment Contract v1.0 |

## 🏗️ Architecture

GlassOps Runtime executes in **6 Strictly Defined Phases**:

Phase 0: **Cache Retrieval**: Restores the environment from the Protocol-Linked Cache to minimize bootstrap latency.

Phase 1: **Policy Phase**: Evaluates governance windows using a UTC-deterministic engine to ensure global policy consistency.

Phase 2: **Bootstrap Phase**: Installs the CLI version explicitly defined in your governance policy to prevent version drift.

Phase 3: **Identity Phase**: Securely authenticates the session and resolves the Identity Contract.

Phase 4: **Contract Validation**: Normalizes session metadata into the machine-readable Deployment Contract v1.0.

Phase 5: **Output Signal**: Emits the `glassops_ready` primitive to authorize downstream execution.

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to build, test, and submit PRs.

## 📄 License

Apache-2.0
