import { createCipheriv, createDecipheriv, createHash, randomBytes, scryptSync } from "crypto";
import { mkdir, readFile, rename, writeFile } from "fs/promises";
import { join } from "path";

export type StoredGoogleOAuth = {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  scope?: string;
};

type TokenEnvelope = {
  version: 1;
  userId: string;
  email: string;
  iv: string;
  authTag: string;
  ciphertext: string;
  updatedAt: string;
};

function storeDirectory(): string {
  return process.env.GRAINBOX_DATA_DIR || "/var/lib/grainbox";
}

function tokenPath(userId: string): string {
  const key = createHash("sha256").update(userId).digest("hex");
  return join(storeDirectory(), "google-calendar", `${key}.json`);
}

function encryptionKey(): Buffer {
  const secret = process.env.GOOGLE_OAUTH_TOKEN_SECRET || process.env.NEXTAUTH_SECRET || "";
  if (!secret) throw new Error("Google OAuth token encryption is not configured");
  return scryptSync(secret, "grainbox-google-calendar-oauth-v1", 32);
}

export async function saveGoogleOAuth(
  userId: string,
  email: string,
  oauth: StoredGoogleOAuth,
): Promise<void> {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(oauth), "utf8"),
    cipher.final(),
  ]);
  const envelope: TokenEnvelope = {
    version: 1,
    userId,
    email,
    iv: iv.toString("base64url"),
    authTag: cipher.getAuthTag().toString("base64url"),
    ciphertext: ciphertext.toString("base64url"),
    updatedAt: new Date().toISOString(),
  };
  const path = tokenPath(userId);
  await mkdir(join(storeDirectory(), "google-calendar"), { recursive: true });
  const temporaryPath = `${path}.${process.pid}.tmp`;
  await writeFile(temporaryPath, JSON.stringify(envelope), { mode: 0o600 });
  await rename(temporaryPath, path);
}

export async function loadGoogleOAuth(userId: string): Promise<StoredGoogleOAuth | null> {
  try {
    const envelope = JSON.parse(await readFile(tokenPath(userId), "utf8")) as TokenEnvelope;
    if (envelope.version !== 1 || envelope.userId !== userId) return null;
    const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), Buffer.from(envelope.iv, "base64url"));
    decipher.setAuthTag(Buffer.from(envelope.authTag, "base64url"));
    const plaintext = Buffer.concat([
      decipher.update(Buffer.from(envelope.ciphertext, "base64url")),
      decipher.final(),
    ]).toString("utf8");
    return JSON.parse(plaintext) as StoredGoogleOAuth;
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
    if (code === "ENOENT") return null;
    throw new Error(`Could not read stored Google OAuth tokens: ${(error as Error).message}`);
  }
}
