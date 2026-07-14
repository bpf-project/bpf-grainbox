# bpf-grainbox

Grainbox product layer for the BPF project.

This repository is the beginning of the migration from the `mnofresno/grainbox`
wrapper. It owns the product UI/API and product features while consuming Vexa
through a narrow, validated provider contract.

## Phase 1

The foundation currently includes:

- strict TypeScript workspace;
- runtime-validated meeting, bot and lifecycle contracts;
- production-shaped Vexa HTTP adapter;
- fake Vexa provider for tests;
- CI for typecheck and unit tests.

Read [docs/architecture.md](docs/architecture.md) and
[docs/migration/phase-1.md](docs/migration/phase-1.md) before adding product
features.

```bash
npm ci
npm run typecheck
npm test
```

No production credentials are required for this phase.

