# `bpf-grainbox` architecture

`bpf-grainbox` is the Grainbox product layer. Vexa is an external runtime
dependency accessed through an adapter; the browser never calls Vexa directly.

```text
browser → bpf-grainbox web/API → Vexa adapter → Vexa runtime
                    │
                    ├── bpf-auth identity
                    ├── product domain/persistence
                    └── transcription, notes, highlights, search, export
```

The product API remains one deployable service. Vexa is deployed separately;
Grainbox owns only the product UI, route adapters, and a small admin client.

## Provider rule

The product API keeps Vexa calls server-side. Identity provisioning uses
`@bpf-project/grainbox-vexa-client`; meeting and transcript routes use the
server-side adapters under `apps/web/src/lib` and `apps/web/src/app/api/vexa`.
Vexa-specific compatibility mapping stays at those boundaries.

## Migration rule

Product features are moved into this repository. Generic browser automation,
meeting capture and runtime primitives remain candidates for Vexa upstream.
The fork is retained only as a rollback provider until the same contract tests
and a real-meeting canary pass against upstream.
