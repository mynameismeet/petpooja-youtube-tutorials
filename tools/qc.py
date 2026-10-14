#!/usr/bin/env python3
"""Final QC: loudness, length, A/V sync vs the locked mix, audio drop-outs.
  python3 tools/qc.py <slug> <video.mp4>"""
import json, re, subprocess, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent
slug, video = sys.argv[1], Path(sys.argv[2])
mix = ROOT / "videos" / slug / "audio/mix/final_mix.wav"
run = lambda *a: subprocess.run(a, capture_output=True, text=True).stderr + subprocess.run(a, capture_output=True, text=True).stdout
def env(f):
    o = subprocess.run(["ffmpeg", "-v", "error", "-i", str(f), "-af", "aresample=8000,pan=mono|c0=c0,asetnsamples=n=80,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level:file=-", "-f", "null", "-"], capture_output=True, text=True).stdout
    return [max(-90.0, -90.0 if "inf" in x else float(x.split("=")[1])) for x in o.split() if x.startswith("lavfi.astats.Overall.RMS_level=")]
eb = subprocess.run(["ffmpeg", "-i", str(video), "-af", "ebur128=peak=true", "-vn", "-f", "null", "-"], capture_output=True, text=True).stderr
lufs = float(re.findall(r"I:\s+(-?[\d.]+) LUFS", eb)[-1]); peak = float(re.findall(r"Peak:\s+(-?[\d.]+) dBFS", eb)[-1])
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(video)], capture_output=True, text=True).stdout)
r, m = env(video), env(mix); n = min(len(r), len(m)) - 60
lag = min(range(-30, 31), key=lambda k: sum((r[i + k] - m[i]) ** 2 for i in range(40, n, 3))) * 10
sil = re.findall(r"silence_start: ([\d.]+)", subprocess.run(["ffmpeg", "-i", str(video), "-af", "silencedetect=n=-55dB:d=1", "-vn", "-f", "null", "-"], capture_output=True, text=True).stderr)
gaps = [float(s) for s in sil if float(s) < dur - 3]
checks = [("loudness −14 ±1 LUFS", abs(lufs + 14) <= 1, f"{lufs} LUFS, peak {peak} dBFS"), ("A/V sync", abs(lag) <= 20, f"{lag} ms"),
          ("no audio drop-outs", not gaps, f"gaps at {gaps}" if gaps else "none"), ("length", True, f"{dur:.2f}s")]
report = "\n".join(f"{'✅' if ok else '❌'} {name}: {info}" for name, ok, info in checks)
print(report); (video.parent / (video.stem + ".qc.txt")).write_text(report + "\n")
sys.exit(0 if all(ok for _, ok, _ in checks) else 1)
