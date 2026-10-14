#!/usr/bin/env python3
"""Cut a rendered tutorial into one MP4 per portion (frame-accurate).
  python3 tools/cut-portions.py <slug> <video.mp4>   -> <video dir>/portions/"""
import json, subprocess, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
slug, video = sys.argv[1], Path(sys.argv[2])
info = json.loads(subprocess.run(["node", str(ROOT / "tools/edit-info.mjs"), slug], capture_output=True, text=True, check=True).stdout)
out = video.parent / "portions"; out.mkdir(exist_ok=True)
for p in info["portions"]:
    f0, f1, fps = p["f0"], p["f0"] + p["dur"], info["fps"]
    dst = out / f"{p['composition']}.mp4"
    subprocess.run(["ffmpeg", "-nostdin", "-v", "error", "-y", "-i", str(video),
                    "-vf", f"trim=start_frame={f0}:end_frame={f1},setpts=PTS-STARTPTS",
                    "-af", f"atrim=start={f0/fps}:end={f1/fps},asetpts=PTS-STARTPTS",
                    "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(dst)], check=True)
    print(f"{dst.name}  {p['dur']/fps:.2f}s")
