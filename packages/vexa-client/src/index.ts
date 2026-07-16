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
