import {
  meetingRuntimeSchema,
  type MeetingRuntime,
} from "@bpf-project/grainbox-contracts";

export type Platform = "google_meet" | "zoom" | "teams";

export type CreateBotInput = {
  platform: Platform;
  native_meeting_id: string;
  meeting_url?: string;
  transcribe_enabled?: boolean;
  recording_enabled?: boolean;
};

export interface VexaProvider {
  createBot(input: CreateBotInput): Promise<MeetingRuntime>;
  getMeeting(meetingId: number): Promise<MeetingRuntime>;
  listMeetings(): Promise<MeetingRuntime[]>;
}

export type VexaClientOptions = {
  baseUrl: string;
  apiToken: string;
  fetch?: typeof fetch;
};

export type VexaAdminClientOptions = {
  baseUrl: string;
  adminApiKey: string;
  fetch?: typeof fetch;
};

export type VexaAdminUser = {
  id: number;
  email: string;
  name?: string | null;
  max_concurrent_bots?: number;
  created_at?: string;
};

/**
 * Small Grainbox-owned adapter for the upstream Vexa admin contract.
 * It intentionally exposes only identity provisioning, not Vexa internals.
 */
export class VexaAdminClient {
  private readonly request: typeof fetch;

  constructor(private readonly options: VexaAdminClientOptions) {
    this.request = options.fetch ?? fetch;
  }

  async findOrCreateUser(email: string, name?: string): Promise<VexaAdminUser> {
    const existing = await this.call<VexaAdminUser>(
      `/admin/users/email/${encodeURIComponent(email)}`,
      { method: "GET" },
      true,
    );
    if (existing) return existing;

    const created = await this.call<VexaAdminUser>("/admin/users", {
      method: "POST",
      body: { email, name, max_concurrent_bots: 5 },
    });
    if (!created) throw new Error("Vexa did not return the created user");
    return created;
  }

  async createUserToken(userId: number, scopes = ["bot", "tx", "browser"]): Promise<string> {
    const query = new URLSearchParams({ scopes: scopes.join(","), name: "bpf-auth-sso" });
    const result = await this.call<{ token?: string }>(
      `/admin/users/${encodeURIComponent(String(userId))}/tokens?${query}`,
      { method: "POST" },
    );
    if (!result) throw new Error("Vexa did not return a token response");
    if (!result.token) throw new Error("Vexa did not return an API token");
    return result.token;
  }

  private async call<T>(
    path: string,
    options: { method: string; body?: unknown },
    allowNotFound = false,
  ): Promise<T | null> {
    const response = await this.request(new URL(path, this.options.baseUrl), {
      method: options.method,
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "X-Admin-API-Key": this.options.adminApiKey,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    if (allowNotFound && response.status === 404) return null;
    if (!response.ok) throw new Error(`Vexa admin request failed: ${response.status}`);
    return (await response.json()) as T;
  }
}

/**
 * VexaHttpClient — adapted for upstream Vexa v0.12 gateway API.
 *
 * Upstream endpoint map (vs old fork):
 * - POST /meetings → POST /bots (bot spawn)
 * - POST /meetings/{id}/bots → removed, use POST /bots with platform+native_meeting_id
 * - POST /bots/{id}/stop → DELETE /bots/{platform}/{native_meeting_id}
 * - GET /meetings/{id} → GET /meetings/{meeting_id}
 * - GET /bots/{id} → removed, use GET /bots + filter
 */
export class VexaHttpClient implements VexaProvider {
  private readonly request: typeof fetch;

  constructor(private readonly options: VexaClientOptions) {
    this.request = options.fetch ?? fetch;
  }

  async createBot(input: CreateBotInput): Promise<MeetingRuntime> {
    const body: Record<string, unknown> = {
      platform: input.platform,
      native_meeting_id: input.native_meeting_id,
    };
    if (input.meeting_url) body.meeting_url = input.meeting_url;
    if (input.transcribe_enabled !== undefined) body.transcribe_enabled = input.transcribe_enabled;
    if (input.recording_enabled !== undefined) body.recording_enabled = input.recording_enabled;
    return this.call("/bots", { method: "POST", body }, meetingRuntimeSchema);
  }

  getMeeting(meetingId: number) {
    return this.call(`/meetings/${meetingId}`, { method: "GET" }, meetingRuntimeSchema);
  }

  async listMeetings(): Promise<MeetingRuntime[]> {
    const response = await this.request(new URL("/meetings", this.options.baseUrl), {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${this.options.apiToken}`,
      },
    });
    if (!response.ok) {
      throw new Error(`Vexa request failed: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return (data.meetings || []).map((m: unknown) => meetingRuntimeSchema.parse(m));
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
