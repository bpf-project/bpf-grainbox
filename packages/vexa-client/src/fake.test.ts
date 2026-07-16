import { describe, expect, it } from "vitest";
import { FakeVexaProvider } from "./fake.js";

describe("FakeVexaProvider", () => {
  it("models the bot creation boundary", async () => {
    const vexa = new FakeVexaProvider();
    const meeting = await vexa.createBot({
      platform: "google_meet",
      native_meeting_id: "abc-defg-hij",
      meeting_url: "https://meet.google.com/abc-defg-hij",
    });

    expect(meeting.platform).toBe("google_meet");
    expect((await vexa.getMeeting(meeting.id)).status).toBe("joining");
  });
});
