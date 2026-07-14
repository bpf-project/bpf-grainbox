import { describe, expect, it } from "vitest";
import { FakeVexaProvider } from "./fake.js";

describe("FakeVexaProvider", () => {
  it("models the create meeting -> start bot boundary", async () => {
    const vexa = new FakeVexaProvider();
    const meeting = await vexa.createMeeting({ platform: "google_meet", userId: "user-1" });
    const bot = await vexa.startBot({ meetingId: meeting.id, userId: "user-1" });

    expect(meeting.provider).toBe("fake");
    expect(bot.meetingId).toBe(meeting.id);
    expect((await vexa.getBot(bot.id)).status).toBe("joining");
  });
});

