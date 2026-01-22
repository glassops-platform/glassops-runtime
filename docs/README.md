# GlassOps Runtime Documentation

## Overview

GlassOps Runtime is a specialized GitHub Action that provides governed, secure, and observable execution environments for Salesforce CLI operations.

## Architecture

The runtime executes in **6 Strictly Defined Phases** with comprehensive **Level 1 Primitive Governance**:

### Phase 0: Pre-Flight Governance (Level 1 Primitive)

- **Environment Context Validation**: Required GitHub environment variables
- **Input Validation & Sanitization**: JWT format, URL validation, required inputs
- **Rate Limiting**: Basic session tracking and concurrency limits
- **Resource Limits**: Execution time caps and resource constraints
- **Data Integrity**: GitHub context validation and compliance checks

### Core Execution Phases

1. **Cache Retrieval Phase**: Restores environment from Protocol-Linked Cache
2. **Policy Phase**: Evaluates governance windows using UTC-deterministic engine
3. **Bootstrap Phase**: Installs CLI version explicitly defined in governance policy
4. **Identity Phase**: Securely authenticates session and resolves Identity Contract
5. **Contract Validation Phase**: Normalizes session metadata into Deployment Contract v1.0
6. **Output Signal Phase**: Emits `glassops_ready` primitive to authorize downstream execution

### Level 1 Primitive Governance Controls

The foundational governance layer enforces:

- **Input Validation**: JWT key format, Salesforce URLs, required parameters
- **Environment Security**: GitHub context validation, repository format checks
- **Resource Protection**: Execution timeouts, memory limits, concurrency controls
- **Compliance Checks**: PR context validation, fork detection warnings
- **Error Categorization**: Phase-specific error types with structured logging
- **Audit Trails**: Comprehensive logging for all governance decisions

## Configuration

### devops-config.json

Create a `devops-config.json` file in your repository root:

```json
{
  "governance": {
    "enabled": true,
    "freeze_windows": [
      {
        "day": "Friday",
        "start": "17:00",
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

### Governance Policies

- **Freeze Windows**: Prevent deployments during specified time windows
- **Approval Gates**: Require manual approval for production deployments
- **Environment Checks**: Validate target org and user permissions

### Runtime Configuration

- **CLI Version Pinning**: Ensures consistent Salesforce CLI versions
- **Node.js Version**: Managed runtime environment
- **Cache Strategy**: Protocol-linked caching for performance

## Usage Examples

### Basic Usage

```yaml
steps:
  - name: Initialize GlassOps Runtime
    uses: glassops-platform/glassops-runtime@v1
    with:
      jwt_key: ${{ secrets.SF_JWT_KEY }}
      client_id: ${{ secrets.SF_CLIENT_ID }}
      username: ${{ vars.SF_USERNAME }}
      instance_url: https://login.salesforce.com
```

### With Governance Enforcement

```yaml
steps:
  - name: Governed Deployment
    uses: glassops-platform/glassops-runtime@v1
    with:
      jwt_key: ${{ secrets.SF_JWT_KEY }}
      client_id: ${{ secrets.SF_CLIENT_ID }}
      username: ${{ vars.SF_USERNAME }}
      enforce_policy: "true"
```

## Deployment Contract

The runtime generates a cryptographic deployment contract containing:

- Schema version and metadata
- Quality metrics (test coverage, pass rates)
- Audit trail (triggered by, org ID, repository, commit)
- Governance status and freeze window evaluation

## Troubleshooting

### Common Issues

1. **Freeze Window Blocks**: Check current UTC time against configured windows
2. **Authentication Failures**: Verify JWT key format and permissions
3. **Cache Misses**: First run may be slower; subsequent runs will use cache
4. **Invalid Configuration**: Ensure `devops-config.json` follows correct schema

### Debug Mode

Set `enforce_policy: "false"` to bypass governance for testing.

## Security

- JWT-OAuth 2.0 authentication with strict identity validation
- Cryptographic deployment contracts for audit trails
- Secure credential handling with automatic cleanup
- UTC-deterministic policy evaluation for global consistency

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for development guidelines.
