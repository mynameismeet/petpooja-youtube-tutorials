#!/usr/bin/env bash
# One command per pipeline step. Claude (via /youtube-tutorial) runs these; you can too.
#   tools/pipeline.sh conform  <slug> <crop w:h:x:y> [width]   G2  join + crop + 30 fps raw parts
#   tools/pipeline.sh voice    <slug>                          G4  script.md -> ElevenLabs (one take per section)
#   tools/pipeline.sh mix      <slug>                          G4  voice + music + SFX -> final_mix + timing.ts
#   tools/pipeline.sh holds    <slug>                          G5  freeze-frame stills used by edit.ts
#   tools/pipeline.sh stills   <slug> <f1,f2,...>              G5  check frames without a full render
#   tools/pipeline.sh studio                                   G5  open Remotion Studio (portions canvas)
#   tools/pipeline.sh finish   <slug>                          G6  render + portion clips + QC report
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
STEP="${1:-help}"; SLUG="${2:-}"
V="videos/$SLUG"; PUB="engine/public/$SLUG"
need_free_mb() { local f; f=$(df -m "$ROOT" | tail -1 | awk '{print $4}'); [ "$f" -ge "$1" ] || { echo "❌ only ${f} MB free — free at least $1 MB first (Trash, Downloads)"; exit 1; }; }

case "$STEP" in
  conform)
    SHEETS="${SHEETS:-/tmp}" tools/analyze-recording.sh "$SLUG" "${3:?crop w:h:x:y}" "${4:-2560}"
    mkdir -p "$PUB/holds" && ln -f "$V/source/screen.mp4" "$PUB/screen.mp4" ;;
  voice)
    python3 tools/script-to-tts.py "$SLUG"
    node tools/tts.mjs render "$SLUG" ;;
  mix)
    python3 tools/mix-audio.py "$SLUG"
    python3 tools/timing.py "$SLUG"
    mkdir -p "$PUB" && cp "$V/audio/mix/final_mix.wav" "$PUB/final_mix.wav" ;;
  holds)
    mkdir -p "$PUB/holds"
    node tools/edit-info.mjs "$SLUG" | python3 -c "import json,sys; print(' '.join(map(str, json.load(sys.stdin)['holdTimes'])))" | tr ' ' '\n' | while read -r t; do
      [ -z "$t" ] && continue
      ms=$(python3 -c "print(round($t*1000))"); f=$(python3 -c "print(round($t*30))")
      [ -f "$PUB/holds/$ms.jpg" ] || ffmpeg -nostdin -v error -y -i "$V/source/screen.mp4" -vf "select=eq(n\,$f)" -frames:v 1 -q:v 2 "$PUB/holds/$ms.jpg"
    done; ls "$PUB/holds" | wc -l | xargs echo "hold stills:" ;;
  stills)
    FULL=$(node tools/edit-info.mjs "$SLUG" | python3 -c "import json,sys; print(json.load(sys.stdin)['full'])")
    OUT="${STILLS_DIR:-/tmp/$SLUG-stills}"; mkdir -p "$OUT"
    node tools/stills.mjs "$ROOT/engine" "$OUT" "${3:?frames}" "$FULL" && echo "stills in $OUT" ;;
  studio)
    cd engine && npx remotion studio ;;
  finish)
    need_free_mb 2000
    pkill -f "remotion studio" 2>/dev/null || true
    FULL=$(node tools/edit-info.mjs "$SLUG" | python3 -c "import json,sys; print(json.load(sys.stdin)['full'])")
    OUTFILE="$ROOT/$V/exports/${SLUG}_$(date +%Y-%m-%d).mp4"; mkdir -p "$V/exports"
    # disk guard: stop the render before macOS swap can fill the disk
    ( while sleep 4; do pgrep -f "remotion render $FULL" >/dev/null || exit 0
        [ "$(df -m "$ROOT" | tail -1 | awk '{print $4}')" -lt 400 ] && { pkill -f "remotion render $FULL"; echo "❌ stopped: disk < 400 MB"; exit 0; }; done ) &
    (cd engine && npx remotion render "$FULL" "$OUTFILE" --codec=h264 --crf=18 --audio-bitrate=192k --concurrency=2 --media-cache-size-in-bytes=300000000)
    python3 tools/cut-portions.py "$SLUG" "$OUTFILE"
    python3 tools/qc.py "$SLUG" "$OUTFILE" ;;
  *) sed -n '2,10p' "$0"; exit 1 ;;
esac
