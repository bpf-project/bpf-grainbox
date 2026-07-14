# Phase 1 — repository foundation

This phase creates the target repository without changing the production
Grainbox deployment.

## Included

- npm workspace and TypeScript strict mode;
- CI for install, typecheck and unit tests;
- versioned Zod contracts for meeting, bot and lifecycle data;
- `VexaProvider` interface;
- HTTP adapter with runtime response validation;
- fake provider for product tests.

## Excluded

- dashboard migration;
- database migration or dual writes;
- Vexa fork changes;
- deployment cutover;
- real credentials and production secrets.

## Exit criteria

```bash
npm ci
npm run typecheck
npm test
```

All three commands must pass in a clean clone before the next phase begins.

