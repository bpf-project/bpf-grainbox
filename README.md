# bpf-grainbox

Grainbox product layer for the BPF project.

This repository owns the Grainbox product UI/API and consumes Vexa as an
external meeting runtime through HTTP/WebSocket boundaries.

## Foundation

The foundation currently includes:

- strict TypeScript workspace;
- narrow Vexa admin client for SSO provisioning;
- server-side Vexa route adapters;
- CI for typecheck and unit tests.

Read [docs/architecture.md](docs/architecture.md) and
[docs/migration/vexa-boundary.md](docs/migration/vexa-boundary.md) before adding
product features.

```bash
npm ci
npm run typecheck
npm test
```

No production credentials are required for this phase.
