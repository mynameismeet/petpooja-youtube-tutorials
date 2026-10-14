---
name: youtube-tutorial
description: Turn a raw Petpooja product screen recording into a polished Hinglish YouTube how-to video (Anika voice, Morning Rises music, zooms, highlights, chapters, editable portions). Use when the user drops a recording into videos/<slug>/source/raw, says "make a tutorial / how-to video", or runs /youtube-tutorial <slug>.
---

# YouTube tutorial pipeline (Petpooja)

Worked example to copy from: `videos/marketing-automation/` + `engine/src/videos/marketing-automation/edit.ts`.
Commands: `tools/pipeline.sh <step> <slug>` (run without args for the list). Rules: `CLAUDE.md`.
**Locked:** Hinglish, ElevenLabs voice Anika (`voice/voice.json`), 1920×1080 30 fps, audio first, render once.
Two human gates: script (G3) and audio (G4). Never render the full video before both are approved.

## 0 · Preflight (every run)
- `engine/node_modules` exists (else `cd engine && npm i`), `.env` has `ELEVENLABS_API_KEY`, Epidemic Sound connector is on.
- `df -h ~` ≥ 2 GB free to work, ≥ 2 GB more at render (8 GB Macs swap onto the disk). Warn the user early if low.
- If `videos/<slug>/` is missing: `tools/new-video.sh <slug> "<Product>" <logo.svg>` and ask for the logo if none.

## G1 · Brief
Fill `videos/<slug>/brief.md`: product, the one task the video teaches, promise, CTA. Ask the user only what the
recording can't tell you.

## G2 · Screen map (Claude reads the footage)
1. `ffprobe` each raw part; make keyframe contact sheets (`-skip_frame nokey`, `fps=1/5`, `tile`) to learn the flow.
2. Crop browser chrome/sidebar/recorder overlays: view a full-res top-left crop, then
   `tools/pipeline.sh conform <slug> <w:h:x:y>` (joins parts in name order, 30 fps, 2560 wide, links into engine).
3. Page changes: `source/scenes.txt`. In-page clicks: frame strips (`fps=10`, small `tile`) around each candidate.
   Record exact source seconds for EVERY click — these become match cuts.
4. What was actually picked/typed: view frames just before each scene change at ~1280 px. Read on-screen text at
   full res. Put "This take's picks" + a footage map (step → source range → click times) into brief/script.
5. UI coordinates for zooms/highlights: grab one 1280 px frame per screen, pair two side by side, read positions;
   source px = displayed px × (pair width / displayed width) ×2 (for 2560 working copy). Pages scroll — re-measure
   after every scroll/drawer.
6. Note anything sensitive (payment popup, QR, real numbers) → footage must end before it.

## G3 · Script (Hinglish) → ✅ user approves
Start from `templates/script.md`. Rules: ~10 words/sentence, respectful "kijiye", one action per sentence, name
only what the recording shows. Intro L02 must be personal: "*Petpooja <Product>* se, aap … bahut *easily* …".
Every click gets `{sfx: click @UIWord}` on the spoken UI word (keep that word in Latin). Each `## ` section = one
voice take; put `{sfx: riser ends @start}` on the reveal line. Send the script; wait for approval.

## G4 · Audio → ✅ user approves
1. `python3 tools/script-to-tts.py <slug>`, then add a `tts` field per line in `script.tts.json`: Hindi words in
   Devanagari, product/UI terms in Latin. **Petpooja → `पेट पूजा`** (users rejected the anglicised "pet-puja").
   New names: test with `node tools/tts.mjs say "<text>" /tmp/x.mp3` + whisper (en and hi) before the full take.
2. `tools/pipeline.sh voice <slug>` (one take per section, split per line with word timings).
3. QC: download whisper `ggml-small-q5_1.bin` to the scratchpad; transcribe each `audio/vo/L*.wav` (hi; re-check
   lines with English words in `-l en` — hi mode loops on English). Every line complete, no repeats. Delete the model after.
4. Music (Epidemic, Morning Rises `07d33825-eeda-32f9-92f6-b650a2da5216`): run `tools/pipeline.sh mix <slug>` once
   to get `audio/mix/timeline.json` → total T and reveal R (start of the reveal line). `EditRecording` with
   `targetDurationMs=T*1000`, `forceDuration`, WAV, `requiredRegionsAtOffsets=[{startMs:103000,endMs:125000,
   offsetMsInEdit: R*1000-14860}]` (track's kick is at 117.86 s) → `PollEditRecordingJob` → `DownloadRecordingEdit`
   → `audio/music/bed.wav`. Measure the kick: lowpass 150 Hz RMS in 25 ms steps near R, first jump >15 dB = K;
   set `music.offset = R - K` in script.tts.json. (Plain track/SFX downloads are blocked on our plan — edits work.)
5. `tools/pipeline.sh mix <slug>` → check: −14 ±1 LUFS, music ~19 dB under voice while speaking, kick on R.
6. Send `audio/mix/final_mix.mp3`; wait for approval. Changes → edit text → `voice` → `mix` again.

## G5 · Edit (Claude writes edit.ts)
1. Copy `engine/src/videos/marketing-automation/edit.ts` to `engine/src/videos/<slug>/edit.ts`; register it in
   `engine/src/videos/index.ts`. Set slug, prefix (2–3 letters), srcW/H, logo, copy (intro title, gradient word,
   pills, end card).
2. SEGMENTS: pin each source click to `click("Lxx")` (its SFX time). Longer output → `hold` on a settled frame
   (start of a page, or just after the last action); shorter → speed-up, add `badge` when ≥3× (waits only).
   Re-order clips freely (e.g. dashboard first). Last segment = hold before anything sensitive.
3. CAMERA: zoom 1.3–2.3 on what the voice names; move ~0.3 s before the line; ascending times; 1 s eases.
4. HIGHLIGHTS: rect in source px for what is named; label short; t0/t1 inside the line; check scroll state.
5. CHAPTERS = section starts; portions = sections (chapter ≥10 s for YouTube).
6. `tools/pipeline.sh holds <slug>`; `node tools/edit-info.mjs <slug>` → slowest clip ≥0.9×, badges sensible.
7. `tools/pipeline.sh stills <slug> <frames>` at every highlight/camera key → fix off-screen or misplaced rings
   (most common: page scrolled, ring at the frame edge). `tools/pipeline.sh studio` so the user can preview.

## G6 · Finish
`tools/pipeline.sh finish <slug>` → render (2 workers, disk guard) → `exports/portions/` clips → QC report
(all ✅ required). Deliver the MP4, the portion folder, YouTube chapters (from the portion starts). Upload docs to
Drive "How-to Videos/<Product>"; the Drive connector can't take big MP4s — ask the user to drag them in.

## Gotchas (all hit before)
- zsh: `"$x:r"`, `"$f0:end…"` are modifiers → always `${x}`. In `while read` loops give ffmpeg `-nostdin`.
- Never `rm` with an unguarded variable path; tools clean their own temp (stills.mjs deletes its bundle).
- Studio and render both eat RAM → close Studio before `finish`. Free disk falls ~1.5 GB during a render (swap).
- ElevenLabs alignment includes `<break>` tag characters; passage mode handles it. Too many breaks = choppy read.
- Line-by-line TTS sounds disconnected — always section takes.
