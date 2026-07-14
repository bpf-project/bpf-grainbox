import type {
  BotRuntime,
  MeetingRuntime,
} from "@bpf-project/grainbox-contracts";
import type {
  CreateMeetingInput,
  StartBotInput,
  VexaProvider,
} from "./index.js";

export class FakeVexaProvider implements VexaProvider {
  readonly meetings = new Map<string, MeetingRuntime>();
  readonly bots = new Map<string, BotRuntime>();

  async createMeeting(input: CreateMeetingInput): Promise<MeetingRuntime> {
    const meeting: MeetingRuntime = {
      id: `meeting-${this.meetings.size + 1}`,
      platform: input.platform,
      joinUrl: `https://meet.google.com/fake-${this.meetings.size + 1}`,
      status: "created",
      provider: "fake",
    };
    this.meetings.set(meeting.id, meeting);
    return meeting;
  }

  async startBot(input: StartBotInput): Promise<BotRuntime> {
    const bot: BotRuntime = {
      id: `bot-${this.bots.size + 1}`,
      meetingId: input.meetingId,
      status: "joining",
      provider: "fake",
    };
    this.bots.set(bot.id, bot);
    return bot;
  }

  async stopBot(botId: string): Promise<BotRuntime> {
    const bot = this.requireBot(botId);
    const stopped = { ...bot, status: "stopped" as const };
    this.bots.set(botId, stopped);
    return stopped;
  }

  async getMeeting(meetingId: string): Promise<MeetingRuntime> {
    const meeting = this.meetings.get(meetingId);
    if (!meeting) throw new Error(`Unknown meeting: ${meetingId}`);
    return meeting;
  }

  async getBot(botId: string): Promise<BotRuntime> {
    return this.requireBot(botId);
  }

  private requireBot(botId: string): BotRuntime {
    const bot = this.bots.get(botId);
    if (!bot) throw new Error(`Unknown bot: ${botId}`);
    return bot;
  }
}

