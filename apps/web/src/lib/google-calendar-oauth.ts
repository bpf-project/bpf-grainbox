const CALLBACK_PATH = "/auth/google-calendar/callback";

function normalizeOrigin(value: string): string {
  return value.trim().replace(/\/$/, "");
}

export function resolveGoogleCalendarRedirectUri(requestOrigin: string): string {
  const explicit = process.env.GOOGLE_MEET_REDIRECT_URI || process.env.GOOGLE_CALENDAR_REDIRECT_URI;
  if (explicit) return explicit;

  // Next runs behind nginx/Rathole and otherwise sees http://0.0.0.0:3000.
  // The OAuth redirect must be the public HTTPS origin registered in Google.
  const publicOrigin = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
  if (publicOrigin) return `${normalizeOrigin(publicOrigin)}${CALLBACK_PATH}`;

  return `${requestOrigin}${CALLBACK_PATH}`;
}

export function isInternalGoogleRedirectUri(value: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.hostname === "0.0.0.0" ||
      url.hostname === "127.0.0.1" ||
      url.hostname === "localhost" ||
      url.protocol !== "https:"
    );
  } catch {
    return true;
  }
}
