# Vexa provider contract

The contract is intentionally small. It covers only the control-plane calls
needed by the first Grainbox product flows.

| Operation | Product responsibility | Provider responsibility |
|---|---|---|
| `createMeeting` | validate user/input and persist intent | create provider room and return URL |
| `startBot` | authorize and associate bot with product meeting | launch bot and return lifecycle state |
| `getMeeting` | map status for the UI | report runtime state |
| `getBot` | map status and diagnostics | report bot state |
| `stopBot` | authorize stop | stop runtime and report result |

Provider responses are validated at the boundary. Adding a new provider must
not require changes to UI components or product domain logic.

