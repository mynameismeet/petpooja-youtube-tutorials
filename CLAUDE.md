# Petpooja YouTube Tutorial Engine

Turns a raw screen recording of any Petpooja product into a polished Hinglish
YouTube tutorial (1920×1080, 30 fps) — rendered **once**, after approvals.
**Procedure: `.claude/skills/youtube-tutorial/SKILL.md`** (`/youtube-tutorial <slug>`). This file = house rules.

## Layout
- `brand/` logos (SVG) · `voice/` voice profile, `voice.json`, reference audio · `tools/` scripts
- `engine/` shared Remotion renderer for every video. Per video: `src/videos/<slug>/edit.ts` (+ generated `timing.ts`),
  registered in `src/videos/index.ts`; assets in `public/<slug>/`, logos in `public/brand/`
- `videos/<slug>/`: `brief.md` · `script.md` · `script.tts.json` · `source/raw/` ← **user drops the recording here** ·
  `source/screen.mp4` · `audio/{vo,music,sfx,mix}` · `exports/`

## Gateway — never skip a gate, never render before G5 ✅
| Gate | Do | Approval |
|---|---|---|
| G1 Brief | `brief.md`: product, audience, CTA, logo | — |
| G2 Screen map | `tools/analyze-recording.sh <slug> <crop>`: join parts, crop browser chrome, 30 fps; read key frames; write the footage map + exact picks into `script.md` | — |
| G3 Script | `script.md` in Hinglish, one line per screen moment, matched to what was actually clicked | ✅ text |
| G4 Audio | `tools/script-to-tts.py` → Devanagari `tts` text → `tools/tts.mjs audition/render` → Epidemic music edit → `tools/mix-audio.py` | ✅ user listens to `audio/mix/final_mix.mp3` |
| G5 Edit lock | pin each source click to its SFX time in `edit.ts` (holds/speed-ups), extract hold stills, split into portions; verify with `tools/stills.mjs` + Studio | ✅ stills/preview |
| G6 Render | one `npx remotion render`, QC loudness/duration, YouTube chapters | — |

## Rules
- **Audio first.** Footage is retimed (speed-ups, holds, re-ordered clips) to the locked audio.
- Script: short sentences (~10 words). Roman Hinglish for review; `tts` field = Hindi words in Devanagari,
  UI/product terms in Latin. Name only what the recording actually shows (re-check picks after every new take).
- **SFX are match cuts:** a click fires on the frame of the on-screen click, anchored to the spoken UI word
  (`{sfx: click @Word}`, word timings from ElevenLabs). Whoosh = chip/stage entrance. Risers END on the reveal cut.
- Music: Epidemic Sound **edits** only (EditRecording → DownloadRecordingEdit; plain track/SFX downloads are blocked on
  this account). Pin the lift on the reveal with `requiredRegionsAtOffsets`, fine-tune with `music.offset`.
  Bed ~19 dB under voice while speaking (gainDb −22, duckRatio 2.5); master −14 LUFS, −1.5 dBTP.
- SFX: house set from `tools/make-sfx.sh` → `sfx/` (original, no licence); per-video overrides in `audio/sfx/`.
- QC before sharing audio: re-transcribe every line (whisper) for skipped words, check clicks land on their word.
- Voice must match `voice/voice-profile.md`. Never clone a real person's voice without written consent.
- Generate the VO **per section** (one take per `## ` block, `tts.mjs render` does this) — line-by-line takes sound
  disconnected. Short pauses come from commas; only `[pp]`/`[ppp]` become break tags.
- Pronunciation: brand names in Devanagari when Hindi-origin — **Petpooja → `पेट पूजा`**. Test new names with
  `tts.mjs say` + whisper before a full render.
- Cut before payment screens, QR codes, personal numbers or anything sensitive; crop browser chrome and recorder overlays.
- Highlight coords are source px and break when the page scrolls — verify each with a still.
- Disk is tight: temp files in the scratchpad, delete models/proxies when done. Secrets only in `.env` (gitignored).

## Script markup
`[p]` 0.35 s · `[pp]` 0.65 s · `[ppp]` 1.2 s · `*word*` emphasis · `{sfx: name @Word|@start|@end}` · `ends` = sound ends there ·
`> screen:` footage for the next line

## Commands
```bash
tools/new-video.sh <slug> "<Product>" <logo.svg>     # G1 scaffold
tools/pipeline.sh conform|voice|mix|holds|stills|studio|finish <slug> …   # see tools/pipeline.sh
```
