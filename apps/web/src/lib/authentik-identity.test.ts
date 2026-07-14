import { describe, expect, it } from "vitest";
import { getAuthentikIdentity } from "./authentik-identity";

describe("getAuthentikIdentity", () => {
  it("accepts only the authenticated proxy marker and normalized email", () => {
    const request = new Request("http://localhost/api/auth/me", {
      headers: {
        "x-authentik-authenticated": "true",
        "x-authentik-email": " User@Example.com ",
        "x-authentik-username": "User Name",
      },
    });

    expect(getAuthentikIdentity(request as never)).toEqual({
      email: "user@example.com",
      name: "User Name",
    });
  });

  it("rejects client requests without the proxy marker", () => {
    const request = new Request("http://localhost/api/auth/me", {
      headers: { "x-authentik-email": "user@example.com" },
    });

    expect(getAuthentikIdentity(request as never)).toBeNull();
  });
});

