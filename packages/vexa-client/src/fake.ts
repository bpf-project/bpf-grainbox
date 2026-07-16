import type { MeetingRuntime } from "@bpf-project/grainbox-contracts";
import type { CreateBotInput, VexaProvider } from "./index.js";

export class FakeVexaProvider implements VexaProvider {
  private readonly meetings = new Map<number, MeetingRuntime>();

  async createBot(input: CreateBotInput): Promise<MeetingRuntime> {
    const id = this.meetings.size + 1;
    const meeting: MeetingRuntime = {
      id,
      user_id: 1,
      platform: input.platform,
      native_meeting_id: input.native_meeting_id,
      constructed_meeting_url: input.meeting_url ?? null,
      status: "joining",
      bot_container_id: null,
      start_time: null,
      end_time: null,
      completion_reason: null,
      data: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.meetings.set(id, meeting);
    return meeting;
  }

  async getMeeting(meetingId: number): Promise<MeetingRuntime> {
    const meeting = this.meetings.get(meetingId);
    if (!meeting) throw new Error(`Unknown meeting: ${meetingId}`);
    return meeting;
  }

  async listMeetings(): Promise<MeetingRuntime[]> {
    return [...this.meetings.values()];
  }
}
