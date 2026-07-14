# Phase 2 — product UI and runtime extraction

The initial migration imports the existing Grainbox dashboard into
`apps/web` so the feature surface remains available while the backend boundary
is extracted. The UI is now owned by this repository; it is not loaded from a
Vexa checkout at build time.

## Current checks

- `npm run typecheck` — pass;
- `npm test` — pass (118 tests, 5 intentionally skipped upstream rendering cases);
- `npm run build:web` — pass;
- release metadata no longer requires a Vexa chart or tag;
- Authentik identity extraction is isolated and tested;
- Docker build files target the workspace layout and support runtime Vexa
  switching through `VEXA_API_URL`.

## Still required before cutover

- move the server routes behind the typed provider rather than direct Vexa
  URL helpers;
- add an Authentik-protected local/remote smoke test;
- deploy on an unused port beside the existing `3001` dashboard;
- run the full feature matrix against the new endpoint;
- only then migrate the product-specific backend features.

