#!/usr/bin/env python3
"""Assemble the G4 audio master for one video.

  python3 tools/mix-audio.py <slug>

Inputs (videos/<slug>/):
  script.tts.json   {"leadIn": 0.6, "tail": 4.0, "music": {"file": "bed.wav", "gainDb": -18},
                     "lines": [{"id": "L01", "text": "...", "pauseAfter": 0.65,
                                "sfx": [{"name": "click", "word": "Aesthetic"},      # on that word
                                        {"name": "riser", "at": "start", "align": "end"}]}]}  # ends at line start
  audio/vo/<id>.mp3 one file per line (tools/tts.mjs render)
  audio/music/<file>, audio/sfx/<name>.wav

Outputs (audio/mix/):
  final_mix.wav + final_mix.mp3   voice + ducked music + sfx, mastered to -14 LUFS / -1.5 dBTP
  vo.wav, music.wav, sfx.wav      stems
  timeline.json                   start/end of every line and sfx -> drives the video edit (G5)
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
slug = sys.argv[1]
V = ROOT / "videos" / slug
A = V / "audio"
OUT = A / "mix"
OUT.mkdir(parents=True, exist_ok=True)
cfg = json.loads((V / "script.tts.json").read_text())


def duration(p: Path) -> float:
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
        capture_output=True, text=True, check=True,
    )
    return float(r.stdout.strip())


def ff(args):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)


def sfx_file(name: str) -> Path:
    """Per-video override in audio/sfx/, else the shared house set in sfx/."""
    own = A / "sfx" / f"{name}.wav"
    return own if own.exists() else ROOT / "sfx" / f"{name}.wav"


def word_end(line_id: str, word: str):
    """End time (s) of `word` inside a line, from the ElevenLabs alignment file."""
    f = A / "vo" / f"{line_id}.align.json"
    if not f.exists():
        return None
    al = json.loads(f.read_text())
    chars = "".join(al["characters"]).lower()
    i = chars.find(word.lower())
    if i < 0:
        return None
    return al["character_end_times_seconds"][i + len(word) - 1]


# 1. Place lines back to back with their scripted pauses
t = cfg.get("leadIn", 0.6)
lines, sfx = [], []
for n, line in enumerate(cfg["lines"]):
    f = A / "vo" / f"{line['id']}.wav"  # passage-mode split (tts.mjs); falls back to per-line mp3
    if not f.exists():
        f = A / "vo" / f"{line['id']}.mp3"
    d = duration(f)
    lines.append({"id": line["id"], "file": f, "start": round(t, 3), "end": round(t + d, 3)})
    for s in line.get("sfx", []):
        if "word" in s:
            w = word_end(line["id"], s["word"])
            if w is None:
                print(f"warning: {line['id']}: word '{s['word']}' not found, using line end")
            when = t + (w if w is not None else d)
        else:
            at = s.get("at", "end")
            when = t if at == "start" else t + d if at == "end" else t + float(at)
        if s.get("align") == "end":  # risers: the sound finishes on the anchor
            when -= duration(sfx_file(s["name"]))
        sfx.append({"name": s["name"], "at": round(max(0.0, when), 3), "gainDb": s.get("gainDb", -14)})
    nxt = cfg["lines"][n + 1] if n + 1 < len(cfg["lines"]) else None
    same_take = line.get("passage") and nxt and nxt.get("passage") == line["passage"]
    t += d + (0 if same_take else line.get("pauseAfter", 0.65))  # inside a take the pause is already in the audio
total = round(t + cfg.get("tail", 4.0), 3)


def bus(items, out: Path, key: str, gain_key=None):
    """Delay every clip to its start time and sum them into one stem."""
    if not items:
        ff(["-f", "lavfi", "-i", f"anullsrc=r=48000:cl=stereo", "-t", str(total), str(out)])
        return
    inputs, chains = [], []
    for i, it in enumerate(items):
        inputs += ["-i", str(it["file"])]
        ms = int(it[key] * 1000)
        g = f",volume={it[gain_key]}dB" if gain_key else ""
        chains.append(f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo{g},adelay={ms}|{ms}[a{i}]")
    mix = "".join(f"[a{i}]" for i in range(len(items)))
    graph = ";".join(chains) + f";{mix}amix=inputs={len(items)}:normalize=0,apad=whole_dur={total}[out]"
    ff([*inputs, "-filter_complex", graph, "-map", "[out]", "-t", str(total), str(out)])


# 2. Stems
bus(lines, OUT / "vo.wav", "start")
for s in sfx:
    s["file"] = sfx_file(s["name"])
bus(sfx, OUT / "sfx.wav", "at", "gainDb")

music = cfg.get("music")
if music:
    m = A / "music" / music["file"]
    fade_out = cfg.get("tail", 4.0)
    # offset < 0 trims the start of the track (pulls a musical hit earlier), > 0 delays it
    off = float(music.get("offset", 0))
    shift = f"atrim=start={-off},asetpts=PTS-STARTPTS," if off < 0 else f"adelay={int(off * 1000)}|{int(off * 1000)}," if off > 0 else ""
    ff([
        "-i", str(m), "-i", str(OUT / "vo.wav"),
        "-filter_complex",
        f"[0:a]aresample=48000,aformat=channel_layouts=stereo,{shift}apad,atrim=0:{total},volume={music.get('gainDb', -18)}dB,"
        f"afade=t=in:d=1.5,afade=t=out:st={total - fade_out}:d={fade_out}[m];"
        f"[m][1:a]sidechaincompress=threshold={music.get('duckThreshold', 0.05)}:ratio={music.get('duckRatio', 2.5)}:attack=60:release=600[out]",
        "-map", "[out]", "-t", str(total), str(OUT / "music.wav"),
    ])
else:
    ff(["-f", "lavfi", "-i", "anullsrc=r=48000:cl=stereo", "-t", str(total), str(OUT / "music.wav")])

# 3. Master
ff([
    "-i", str(OUT / "vo.wav"), "-i", str(OUT / "music.wav"), "-i", str(OUT / "sfx.wav"),
    "-filter_complex",
    "[0:a][1:a][2:a]amix=inputs=3:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=7,aresample=48000[out]",
    "-map", "[out]", str(OUT / "final_mix.wav"),
])
ff(["-i", str(OUT / "final_mix.wav"), "-b:a", "192k", str(OUT / "final_mix.mp3")])

(OUT / "timeline.json").write_text(json.dumps({
    "duration": total,
    "lines": [{k: v for k, v in l.items() if k != "file"} for l in lines],
    "sfx": [{k: v for k, v in s.items() if k != "file"} for s in sfx],
}, indent=2))
print(f"final_mix: {total:.1f}s, {len(lines)} lines, {len(sfx)} sfx -> {OUT.relative_to(ROOT)}")
