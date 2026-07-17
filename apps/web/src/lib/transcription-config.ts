export interface TranscriptionConfig {
  backend: string;
  model: string;
  label: string;
}

export function getTranscriptionConfig(
  env: Record<string, string | undefined> = process.env,
): TranscriptionConfig {
  const backend = (env.TRANSCRIPTION_BACKEND || "whisper").trim().toLowerCase();
  const whisperModelSize = env.WHISPER_MODEL_SIZE || "base";
  const model =
    env.TRANSCRIPTION_MODEL ||
    (backend === "parakeet"
      ? env.PARAKEET_MODEL_ID || "sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8"
      : `Systran/faster-whisper-${whisperModelSize}`);

  const label =
    backend === "parakeet"
      ? "Parakeet TDT v3 INT8"
      : backend === "whisper"
        ? `Whisper ${whisperModelSize}`
        : model;

  return { backend, model, label };
}
