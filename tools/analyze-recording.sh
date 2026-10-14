#!/usr/bin/env bash
# G2 screen map. Joins every part in videos/<slug>/source/raw/ (in name order),
# crops browser chrome, conforms to 30 fps and maps what happens when.
#   tools/analyze-recording.sh <slug> [crop w:h:x:y] [width]
#   e.g. tools/analyze-recording.sh marketing-automation 3276:2050:112:96 2560
# Writes source/screen.mp4 (working copy), source/scenes.txt (page changes, s),
# and contact sheets (a frame every 3 s) into the scratch dir given by $SHEETS (default /tmp).
set -euo pipefail
SLUG="$1"; CROP="${2:-}"; WIDTH="${3:-2560}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/videos/$SLUG/source"; SHEETS="${SHEETS:-/tmp}"
shopt -s nullglob; PARTS=("$SRC"/raw/*.mov "$SRC"/raw/*.mp4); [ ${#PARTS[@]} -gt 0 ] || { echo "no files in $SRC/raw"; exit 1; }

IN=(); CHAINS=""; LABELS=""
for i in "${!PARTS[@]}"; do
  IN+=(-hwaccel videotoolbox -i "${PARTS[$i]}")
  F="fps=30,scale=$WIDTH:-2:flags=lanczos,setsar=1"; [ -n "$CROP" ] && F="crop=$CROP,$F"
  CHAINS+="[$i:v]$F[v$i];"; LABELS+="[v$i]"
  echo "part $((i+1)): $(basename "${PARTS[$i]}") $(ffprobe -v error -show_entries format=duration -of csv=p=0 "${PARTS[$i]}")s"
done
ffmpeg -v error -y "${IN[@]}" -filter_complex "${CHAINS}${LABELS}concat=n=${#PARTS[@]}:v=1:a=0,format=yuv420p[v]" \
  -map "[v]" -c:v libx264 -preset medium -crf 18 -g 30 -movflags +faststart "$SRC/screen.mp4"

ffmpeg -i "$SRC/screen.mp4" -vf "scale=320:-2,select='gt(scene,0.06)',metadata=print:file=-" -an -f null - 2>/dev/null \
  | grep -oE "pts_time:[0-9.]+" | cut -d: -f2 > "$SRC/scenes.txt"
ffmpeg -v error -y -i "$SRC/screen.mp4" -vf "fps=1/3,scale=400:-2,tile=6x4:padding=3" "$SHEETS/${SLUG}_sheet_%02d.jpg"
echo "scenes: $(wc -l < "$SRC/scenes.txt") · working copy: $SRC/screen.mp4 · sheets: $SHEETS/${SLUG}_sheet_*.jpg"
