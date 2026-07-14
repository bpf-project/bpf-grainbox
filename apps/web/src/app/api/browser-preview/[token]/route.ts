import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const upstream = process.env.VEXA_API_URL || "http://host.docker.internal:8056";
  const path = `/b/${encodeURIComponent(token)}/vnc/vnc.html?autoconnect=true&resize=scale&reconnect=true&view_only=true&path=b/${encodeURIComponent(token)}/vnc/websockify`;

  try {
    const response = await fetch(`${upstream}${path}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    return NextResponse.json({ available: response.ok });
  } catch {
    return NextResponse.json({ available: false });
  }
}
