#!/usr/bin/env bash
set -euo pipefail

backend="${TRANSCRIPTION_BACKEND:-whisper}"
compose_file="${TRANSCRIPTION_COMPOSE_FILE:-deploy/compose/transcription.yml}"
project="${TRANSCRIPTION_COMPOSE_PROJECT:-grainbox-transcription}"
parakeet_image="${PARAKEET_IMAGE:-ghcr.io/likeablob/parakeet-api:latest}"
parakeet_model="${PARAKEET_MODEL_ID:-sherpa-onnx-nemo-parakeet-tdt-0.6b-v3-int8}"

case "$backend" in
  whisper|parakeet) ;;
  *) echo "Unsupported TRANSCRIPTION_BACKEND=$backend (use whisper or parakeet)" >&2; exit 2 ;;
esac

compose=(docker compose -p "$project" -f "$compose_file" --profile "$backend")

prepare_parakeet_model() {
  local volume="${project}_parakeet-models"
  local model_dir="/app/models/sherpa/$parakeet_model"

  docker volume create "$volume" >/dev/null
  if docker run --rm -v "$volume:/app/models" alpine test -f "$model_dir/encoder.int8.onnx"; then
    return
  fi

  docker run --rm --entrypoint uv \
    -v "$volume:/app/models" \
    -e STT__MODELS_DIR=/app/models \
    -e STT__SHERPA__MODEL_ID="$parakeet_model" \
    "$parakeet_image" run --no-sync parakeet-api download sherpa --out /app/models

  docker run --rm --entrypoint python \
    -v "$volume:/app/models" \
    "$parakeet_image" -c 'import bz2, os, tarfile; root="/app/models/sherpa"; archives=[p for p in os.listdir(root) if p.endswith(".tar.bz2")]; [tarfile.open(fileobj=bz2.BZ2File(os.path.join(root, p)), mode="r|").extractall(root) or os.remove(os.path.join(root, p)) for p in archives]'
}

if [[ "$backend" == "parakeet" ]]; then
  prepare_parakeet_model
fi

"${compose[@]}" up -d --force-recreate "transcription-$backend"
"${compose[@]}" ps
