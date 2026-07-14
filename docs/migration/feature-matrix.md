# Grainbox migration feature matrix

This matrix is deliberately split between source migration and runtime verification. A migrated component is not marked fully passing until it has been exercised behind Authentik against the deployed Vexa-compatible services.

Run the source inventory with:

```bash
npm run check:feature-matrix
```

## Old dashboard surface vs bpf-grainbox

| Feature | Old dashboard | New repo source | Runtime status | Evidence / next check |
|---|---:|---:|---:|---|
| UI shell/navigation | yes | yes | PASS (source) | Next: authenticated Playwright |
| Meetings list/detail | yes | yes | PENDING | Authenticated API + fixture |
| Join existing meeting | yes | yes | PENDING | Real bot join canary |
| Create Google Meet | yes | yes | PENDING | Calendar OAuth + bot pre-join |
| Live transcript | yes | yes | PENDING | WebSocket and transcript event canary |
| Recording playback | yes | yes | PENDING | Media endpoint and browser playback |
| Browser/VNC session | yes | yes | PENDING | VNC/session lifecycle |
| Notes/highlights | yes | yes | PENDING | Meeting detail action flow |
| Search/exports | yes | yes | PENDING | Search, TXT/JSON/SRT/VTT downloads |
| Webhooks | yes | yes | PENDING | Config, delivery, test, rotation |
| Admin users/bots | yes | yes | PENDING | Authentik claims + admin API |
| MCP/agent | yes | yes | PENDING | Live upstream contract |
| Authentik SSO/provisioning | yes (proxy headers) | boundary migrated | PENDING | Authenticated browser + provisioned Vexa user |
| Typed Vexa adapter | no dedicated product boundary | yes | PASS (unit) | `packages/vexa-client` tests |
| Docker/local health | implicit | yes | PASS | Build + `/api/health` smoke |
| Dell/VPS production path | yes | compose + canary | PASS (infra) | New container healthy on Dell `3010`; Rathole target switched while old dashboard remains on `3001` for rollback |

## Current interpretation

There is no source-level regression in the dashboard route surface: the new repo owns the old pages and API route inventory. The remaining risk is runtime, not page presence: most legacy routes still call Vexa through compatibility URLs, while the new typed provider is not yet the single server-side boundary. The matrix must remain non-green until the authenticated canary proves those flows.

The Authentik contract is compatible with the existing VPS nginx setup only when nginx supplies `X-Authentik-Authenticated: true`, `X-Authentik-Email`, and `X-Authentik-Username`. Direct access to the new container must therefore not be treated as equivalent to production access. The production canary currently proves the gate and transport, but the feature rows remain pending until a real authenticated browser session exercises them.
