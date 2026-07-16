import { afterEach, describe, expect, it } from "vitest";
import {
  isInternalGoogleRedirectUri,
  resolveGoogleCalendarRedirectUri,
} from "../src/lib/google-calendar-oauth";

const original = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL,
  nextAuthUrl: process.env.NEXTAUTH_URL,
  meetRedirect: process.env.GOOGLE_MEET_REDIRECT_URI,
  calendarRedirect: process.env.GOOGLE_CALENDAR_REDIRECT_URI,
};

afterEach(() => {
  process.env.NEXT_PUBLIC_APP_URL = original.appUrl;
  process.env.NEXTAUTH_URL = original.nextAuthUrl;
  process.env.GOOGLE_MEET_REDIRECT_URI = original.meetRedirect;
  process.env.GOOGLE_CALENDAR_REDIRECT_URI = original.calendarRedirect;
});

describe("Google Calendar OAuth redirect", () => {
  it("prefers the explicit public app URL behind a reverse proxy", () => {
    delete process.env.GOOGLE_MEET_REDIRECT_URI;
    delete process.env.GOOGLE_CALENDAR_REDIRECT_URI;
    process.env.NEXT_PUBLIC_APP_URL = "https://grainbox.easycasual.app/";

    expect(resolveGoogleCalendarRedirectUri("http://0.0.0.0:3000")).toBe(
      "https://grainbox.easycasual.app/auth/google-calendar/callback",
    );
  });

  it("rejects container and non-HTTPS callback origins", () => {
    expect(isInternalGoogleRedirectUri("http://0.0.0.0:3000/auth/google-calendar/callback")).toBe(true);
    expect(isInternalGoogleRedirectUri("https://grainbox.easycasual.app/auth/google-calendar/callback")).toBe(false);
  });
});
