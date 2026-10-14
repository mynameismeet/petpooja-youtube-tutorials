#!/usr/bin/env bash
# Start a new tutorial:  tools/new-video.sh <slug> "<Product name>" [logo.svg]
#   e.g. tools/new-video.sh attendo-register-employee "Attendo" ~/Downloads/attendo.svg
# Creates videos/<slug>/ (drop the recording into source/raw/), brief + script templates,
# and the logo variants. engine/src/videos/<slug>/edit.ts is written later (G5).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"; cd "$ROOT"
SLUG="${1:?slug, e.g. attendo-register-employee}"; PRODUCT="${2:?Product name}"; LOGO="${3:-}"
V="videos/$SLUG"
[ -e "$V" ] && { echo "$V already exists"; exit 1; }
mkdir -p "$V/source/raw" "$V/audio/vo" "$V/audio/music" "$V/audio/sfx" "$V/audio/mix" "$V/exports" "engine/public/$SLUG/holds"
for f in brief.md script.md; do sed -e "s/{{PRODUCT}}/$PRODUCT/g" -e "s/{{SLUG}}/$SLUG/g" "templates/$f" > "$V/$f"; done
cp "templates/raw-README.md" "$V/source/raw/README.md"
if [ -n "$LOGO" ]; then
  B=$(basename "$LOGO" .svg); cp "$LOGO" "brand/$B.svg"
  python3 tools/logo-variant.py "brand/$B.svg" "engine/public/brand/$B-white.svg"
  echo "logo for edit.ts: brand/$B-white.svg"
fi
echo "✅ $V ready — drop the screen recording into $V/source/raw/ and run /youtube-tutorial $SLUG in Claude"
