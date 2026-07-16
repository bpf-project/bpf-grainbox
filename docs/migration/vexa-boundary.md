# Vexa boundary

`bpf-grainbox` is the product and identity layer. Vexa remains the meeting
runtime. Grainbox communicates with it through the small
`@bpf-project/grainbox-vexa-client` workspace package and server-side route
adapters.

The client package owns only stable integration contracts:

- bot create/list/get operations;
- Authentik user lookup/create and scoped token minting;
- Grainbox-owned runtime schemas.

It must not copy Vexa services, database models, dashboard pages, or internal
business logic. New Vexa behavior belongs upstream first when it is generally
useful; Grainbox-specific behavior belongs in `apps/web` or a narrow adapter.

The current UI still contains legacy-compatible types and route adapters where
the product surface needs them. Those are migration debt, not permission to
vendor the Vexa dashboard. The next cleanup should replace each such use with
the client/contracts package only when the contract is covered by a test.
