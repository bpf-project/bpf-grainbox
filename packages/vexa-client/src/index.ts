import {
  botRuntimeSchema,
  meetingRuntimeSchema,
  type BotRuntime,
  type MeetingRuntime,
} from "@bpf-project/grainbox-contracts";

export type CreateMeetingInput = {
  platform: "google_meet" | "zoom" | "teams";
  title?: string;
  userId: string;
};

export type StartBotInput = {
  meetingId: string;
  userId: string;
};

export interface VexaProvider {
  createMeeting(input: CreateMeetingInput): Promise<MeetingRuntime>;
  startBot(input: StartBotInput): Promise<BotRuntime>;
  stopBot(botId: string): Promise<BotRuntime>;
  getMeeting(meetingId: string): Promise<MeetingRuntime>;
  getBot(botId: string): Promise<BotRuntime>;
}

export type VexaClientOptions = {
  baseUrl: string;
  apiToken: string;
  fetch?: typeof fetch;
};

export class VexaHttpClient implements VexaProvider {
  private readonly request: typeof fetch;

  constructor(private readonly options: VexaClientOptions) {
    this.request = options.fetch ?? fetch;
  }

  createMeeting(input: CreateMeetingInput) {
    return this.call("/meetings", { method: "POST", body: input }, meetingRuntimeSchema);
  }

  startBot(input: StartBotInput) {
    return this.call(`/meetings/${input.meetingId}/bots`, { method: "POST", body: input }, botRuntimeSchema);
  }

  stopBot(botId: string) {
    return this.call(`/bots/${botId}/stop`, { method: "POST" }, botRuntimeSchema);
  }

  getMeeting(meetingId: string) {
    return this.call(`/meetings/${meetingId}`, { method: "GET" }, meetingRuntimeSchema);
  }

  getBot(botId: string) {
    return this.call(`/bots/${botId}`, { method: "GET" }, botRuntimeSchema);
  }

  private async call<T extends { parse: (value: unknown) => unknown }>(
    path: string,
    options: { method: string; body?: unknown },
    schema: T,
  ): Promise<ReturnType<T["parse"]>> {
    const response = await this.request(new URL(path, this.options.baseUrl), {
      method: options.method,
      headers: {
        accept: "application/json",
        authorization: `Bearer ${this.options.apiToken}`,
        ...(options.body ? { "content-type": "application/json" } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Vexa request failed: ${response.status} ${response.statusText}`);
    }

    return schema.parse(await response.json()) as ReturnType<T["parse"]>;
  }
}

