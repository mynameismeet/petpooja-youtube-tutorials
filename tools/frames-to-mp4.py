#!/usr/bin/env python3
"""Turn a cdp.mjs screencast (frames/*.jpg + events.json) into a 30 fps, 2560-wide MP4 (window's own aspect).
Chrome only sends a frame when the page repaints, so each frame is held until the next one.

  python3 tools/frames-to-mp4.py <recdir> <out.mp4> [--clean]   (--clean deletes the frames after)
"""
import json
import shutil
import subprocess
import sys
from pathlib import Path

rec, out = Path(sys.argv[1]), Path(sys.argv[2])
meta = json.loads((rec / "events.json").read_text())
frames = meta["frames"]
end = max(e["t"] for e in meta["events"]) + meta["t0Offset"] + 0.5  # events are relative to t0
lines = []
for i, f in enumerate(frames):
    nxt = frames[i + 1]["t"] if i + 1 < len(frames) else max(end, f["t"] + 1 / 30)
    lines += [f"file '{(rec / f['f']).resolve()}'", f"duration {max(nxt - f['t'], 0.001):.4f}"]
lines.append(f"file '{(rec / frames[-1]['f']).resolve()}'")  # concat demuxer needs the last file twice
lst = rec / "frames.txt"
lst.write_text("\n".join(lines) + "\n")
out.parent.mkdir(parents=True, exist_ok=True)
subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst),
                "-vf", "scale=2560:-2:flags=lanczos,fps=30",
                "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p", str(out)], check=True)
dur = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(out)],
                     capture_output=True, text=True).stdout.strip()
print(f"{out}: {dur}s from {len(frames)} frames (video t = event t + {meta['t0Offset']}s)")
if "--clean" in sys.argv:
    shutil.rmtree(rec / "frames")
    lst.unlink()
