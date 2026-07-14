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

The first implementation keeps the product API as one deployable service.
Boundaries are packages and contracts first; service splitting is deferred
until runtime measurements justify it.

## Provider rule

The product API depends on `VexaProvider`, never on Vexa route names or response
shapes. `VexaHttpClient` is the production adapter and `FakeVexaProvider` is the
test adapter. A fork-specific compatibility mapping belongs inside the adapter
and must have an expiry issue or deletion milestone.

## Migration rule

Product features are moved into this repository. Generic browser automation,
meeting capture and runtime primitives remain candidates for Vexa upstream.
The fork is retained only as a rollback provider until the same contract tests
and a real-meeting canary pass against upstream.

