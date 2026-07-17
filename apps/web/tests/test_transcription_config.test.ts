import { describe, expect, it } from "vitest";
import { getTranscriptionConfig } from "@/lib/transcription-config";

describe("getTranscriptionConfig", () => {
  it("defaults to the faster-whisper base model", () => {
    expect(getTranscriptionConfig({})).toEqual({
      backend: "whisper",
      model: "Systran/faster-whisper-base",
      label: "Whisper base",
    });
  });

  it("derives the active Parakeet model from deployment settings", () => {
    expect(
      getTranscriptionConfig({
        TRANSCRIPTION_BACKEND: "parakeet",
        PARAKEET_MODEL_ID: "custom-parakeet-model",
      }),
    ).toEqual({
      backend: "parakeet",
      model: "custom-parakeet-model",
      label: "Parakeet TDT v3 INT8",
    });
  });

  it("prefers an explicitly named model", () => {
    expect(
      getTranscriptionConfig({
        TRANSCRIPTION_BACKEND: "whisper",
        TRANSCRIPTION_MODEL: "my-whisper-model",
        WHISPER_MODEL_SIZE: "large-v3",
      }).model,
    ).toBe("my-whisper-model");
  });
});
