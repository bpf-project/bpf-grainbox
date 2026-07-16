# Vexa boundary

`bpf-grainbox` is the product and identity layer. Vexa remains the meeting
runtime. Grainbox communicates with it through the small
`@bpf-project/grainbox-vexa-client` workspace package and server-side route
adapters.

The client package owns only the stable admin integration:

- Authentik user lookup/create and scoped token minting;
- no Vexa UI, database model, or runtime implementation.

It must not copy Vexa services, database models, dashboard pages, or internal
business logic. New Vexa behavior belongs upstream first when it is generally
useful; Grainbox-specific behavior belongs in `apps/web` or a narrow adapter.

The UI still has product-facing Vexa types and route adapters because those
shapes are used by the current Grainbox screens. They are not a vendored Vexa
runtime and should remain server-side.
