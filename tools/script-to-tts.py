#!/usr/bin/env python3
"""Turn an approved script.md into script.tts.json (G3 -> G4).

  python3 tools/script-to-tts.py <slug>

Parses **Lxx** lines, the pause marker at the end of each line (pauseAfter), and
{sfx: name @Word} cues. A cue on a "## step" or "> screen:" line attaches to the
next voice line at its start; "ends" in the cue means the sound ENDS there (risers).
Keeps any `tts` text already written (Hindi in Devanagari) so re-running is safe.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
slug = sys.argv[1]
V = ROOT / "videos" / slug
src = (V / "script.md").read_text()
out_file = V / "script.tts.json"
old = {}
if out_file.exists():
    old = {l["id"]: l for l in json.loads(out_file.read_text()).get("lines", [])}

PAUSE = {"[p]": 0.35, "[pp]": 0.65, "[ppp]": 1.2}
SFX = re.compile(r"\{sfx:\s*([a-z]+)([^}]*)\}")
GAIN = {"click": -16, "whoosh": -20, "success": -15, "riser": -20}


def cue(name: str, rest: str, inline: bool) -> dict:
    c = {"name": name, "gainDb": GAIN.get(name, -16)}
    m = re.search(r"@(\S+)", rest)
    anchor = m.group(1) if m else ("end" if inline else "start")
    if anchor in ("start", "end"):
        c["at"] = anchor
    else:
        c["word"] = anchor.strip("—-,.")
    if "ends" in rest:
        c["align"] = "end"
    return c


lines, pending = [], []
section = -1
for raw in src.splitlines():
    if raw.startswith("## "):
        section += 1
    m = re.match(r"^\*\*(L\d+)\*\*\s+(.*)$", raw)
    if not m:
        if raw.startswith("## ") or raw.startswith("> screen"):
            pending += [cue(n, r, False) for n, r in SFX.findall(raw)]
        continue
    lid, body = m.groups()
    sfx = pending + [cue(n, r, True) for n, r in SFX.findall(body)]
    pending = []
    text = SFX.sub("", body).strip()
    tail = re.search(r"(\[p+\])\s*$", text)
    pause = PAUSE[tail.group(1)] if tail else 0.65
    text = re.sub(r"\s*\[p+\]\s*$", "", text).strip()
    # one passage per "## " section: generated as ONE take so intonation flows (tts.mjs)
    entry = {"id": lid, "passage": f"S{max(section, 0)}", "text": text, "pauseAfter": pause, "sfx": sfx}
    if lid in old and old[lid].get("tts") and old[lid]["text"] == text:
        entry["tts"] = old[lid]["tts"]
    lines.append(entry)

cfg = {"leadIn": 0.9, "tail": 4.0, "music": {"file": "bed.wav", "gainDb": -18}, "lines": lines}
if out_file.exists():
    prev = json.loads(out_file.read_text())
    cfg.update({k: prev[k] for k in ("leadIn", "tail", "music") if k in prev})
out_file.write_text(json.dumps(cfg, indent=2, ensure_ascii=False) + "\n")
missing = [l["id"] for l in lines if "tts" not in l]
print(f"{len(lines)} lines, {sum(len(l['sfx']) for l in lines)} sfx -> {out_file.relative_to(ROOT)}")
if missing:
    print("needs Devanagari `tts` text:", " ".join(missing))
