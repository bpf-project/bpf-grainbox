import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthentikIdentity } from "@/lib/authentik-identity";
import { VexaAdminClient } from "@bpf-project/grainbox-vexa-client";

const VEXA_TOKEN_COOKIE = "vexa-token";
const VEXA_USER_INFO_COOKIE = "vexa-user-info";

type VexaUser = {
  id: number;
  email: string;
  name?: string | null;
  max_concurrent_bots?: number;
  created_at?: string;
};

async function provisionFromAuthentik(email: string, name: string): Promise<{ user: VexaUser; token: string }> {
  const adminUrl = process.env.VEXA_ADMIN_API_URL || process.env.VEXA_API_URL || "http://localhost:8056";
  const adminKey = process.env.VEXA_ADMIN_API_KEY || "";
  if (!adminKey) throw new Error("VEXA_ADMIN_API_KEY is not configured");

  const client = new VexaAdminClient({ baseUrl: adminUrl, adminApiKey: adminKey });
  const user = await client.findOrCreateUser(email, name);
  // Upstream only exposes token metadata on GET; the secret is returned once
  // by POST, so mint a scoped session token when the Grainbox cookie is absent.
  const token = await client.createUserToken(user.id);

  return { user, token };
}

/**
 * Get current user info from token.
 * Auth chain: cookie only. No fallback to env vars.
 * User identity resolved via gateway /auth/me.
 */
export async function GET(request: NextRequest) {
  const VEXA_API_URL = process.env.VEXA_API_URL || "http://localhost:8056";

  const cookieStore = await cookies();
  const cookieToken = cookieStore.get("vexa-token")?.value;
  const authentikIdentity = getAuthentikIdentity(request);

  let token = cookieToken || "";

  if (token) try {
    // Resolve user identity via gateway /auth/me
    const response = await fetch(`${VEXA_API_URL}/auth/me`, {
      headers: { "X-API-Key": token },
    });

    if (!response.ok) {
      if (cookieToken) cookieStore.delete(VEXA_TOKEN_COOKIE);
      token = "";
    } else {
      const data = await response.json();
      const user = {
        id: data.user_id,
        email: data.email,
        name: data.name || data.email,
      };
      return NextResponse.json({ authenticated: true, user, token });
    }
  } catch (error) {
    console.error("Vexa token verification error:", error);
    token = "";
  }

  if (authentikIdentity) {
    try {
      const provisioned = await provisionFromAuthentik(
        authentikIdentity.email,
        authentikIdentity.name,
      );
      const response = NextResponse.json({
        authenticated: true,
        user: provisioned.user,
        token: provisioned.token,
        identityProvider: "bpf-auth",
      });
      response.cookies.set(VEXA_TOKEN_COOKIE, provisioned.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
      response.cookies.set(VEXA_USER_INFO_COOKIE, JSON.stringify(provisioned.user), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
      });
      return response;
    } catch (error) {
      console.error("Authentik-to-Vexa provisioning error:", error);
      return NextResponse.json(
        { error: "Could not synchronize the bpf-auth user with Grainbox" },
        { status: 502 },
      );
    }
  }

  return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
}
