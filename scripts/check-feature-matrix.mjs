import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const rows = [
  ["UI shell and navigation", "apps/web/src/app/layout.tsx", "PASS", "Route source migrated"],
  ["Meetings list and detail", "apps/web/src/app/meetings/page.tsx", "PASS", "UI source migrated; live auth/runtime still required"],
  ["Join existing meeting", "apps/web/src/app/join/page.tsx", "PASS", "UI source migrated; live bot join still required"],
  ["Create Google Meet", "apps/web/src/app/api/google-meet/create/route.ts", "PENDING", "Requires Google Calendar OAuth and live bot canary"],
  ["Live transcript websocket", "apps/web/src/components/transcript/transcript-viewer.tsx", "PENDING", "Requires authenticated browser and live Vexa websocket"],
  ["Recording playback", "apps/web/src/lib/api.ts", "PENDING", "Requires live recording/media contract"],
  ["Browser/VNC session", "apps/web/src/app/meetings/[id]/page.tsx", "PENDING", "Requires live browser session and VNC contract"],
  ["Notes and highlights", "apps/web/src/app/meetings/[id]/page.tsx", "PENDING", "Requires authenticated meeting fixture"],
  ["Search and exports", "apps/web/src/lib/export.ts", "PENDING", "Requires authenticated meeting fixture"],
  ["Webhooks", "apps/web/src/app/webhooks/page.tsx", "PENDING", "Requires admin/user API contract test"],
  ["Admin users/bots", "apps/web/src/app/admin/users/page.tsx", "PENDING", "Requires Authentik admin claim and live admin API"],
  ["MCP and agent routes", "apps/web/src/app/mcp/page.tsx", "PENDING", "Requires live upstream contract"],
  ["Authentik identity boundary", "apps/web/src/lib/authentik-identity.ts", "PASS", "Trusted proxy headers normalized and unit-tested"],
  ["Typed Vexa provider package", "packages/vexa-client/src/index.ts", "PASS", "Contract package and fake provider tested"],
  ["Docker runtime", "deploy/docker/Dockerfile.web", "PASS", "Image build and local health smoke passed"],
  ["Dell/VPS canary", "deploy/compose/grainbox.yml", "PASS", "Deployed healthy on Dell:3010; Rathole service active; production Authentik gate preserved"],
];

const check = rows.map(([feature, file, status, evidence]) => ({
  feature,
  file,
  status: existsSync(resolve(root, file)) ? status : "FAIL",
  evidence: existsSync(resolve(root, file)) ? evidence : "Expected migrated source file is missing",
}));

const counts = check.reduce((acc, row) => {
  acc[row.status] = (acc[row.status] || 0) + 1;
  return acc;
}, {});

console.log(JSON.stringify({ generatedAt: new Date().toISOString(), counts, rows: check }, null, 2));

if (check.some((row) => row.status === "FAIL")) process.exitCode = 1;
