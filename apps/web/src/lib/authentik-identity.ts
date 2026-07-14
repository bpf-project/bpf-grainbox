import type { NextRequest } from "next/server";

export type AuthentikIdentity = {
  email: string;
  name: string;
};

/**
 * Identity forwarded by the Authentik nginx proxy provider.
 * These headers are trusted only on the server-side request path protected by
 * nginx auth_request; they are never accepted from browser fetch input.
 */
export function getAuthentikIdentity(request: NextRequest): AuthentikIdentity | null {
  if (request.headers.get("x-authentik-authenticated") !== "true") return null;

  const email = request.headers.get("x-authentik-email")?.trim().toLowerCase() || "";
  if (!email || !email.includes("@")) return null;

  return {
    email,
    name: request.headers.get("x-authentik-username")?.trim() || email,
  };
}

