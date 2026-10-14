# Petpooja YouTube Tutorial Kit

Drop a screen recording → get a polished **Hinglish how-to video** (Anika voice, music, zooms, highlights,
chapters) plus one clip per step. Claude does the work; you approve the **script** and the **audio**.

Example output: `videos/marketing-automation/exports/` (Meta Ads with AI, 3:18).

## One-time setup (≈20 min)
1. Mac with **16 GB RAM** and **15 GB free disk** recommended (8 GB works but is slow and needs disk headroom).
2. Install tools: `brew install node ffmpeg whisper-cpp gh`
3. Install **Claude desktop** → Code tab → open this folder.
4. `cd engine && npm i`
5. `cp .env.example .env` and paste the shared Petpooja **ElevenLabs** key (ask your lead; never commit it).
6. In Claude, enable the **Epidemic Sound** connector (shared Petpooja plan) and the **Google Drive** connector.

## Make a video
1. In Claude: *"New tutorial for Attendo — register an employee"* (or run
   `tools/new-video.sh attendo-register-employee "Attendo" path/to/logo.svg`).
2. Drop the recording into `videos/<slug>/source/raw/` (`01 ….mov`, `02 ….mov` if in parts).
   Record calmly: pause 1–2 s on each new screen, don't open payment/QR screens.
3. In Claude: `/youtube-tutorial <slug>`
4. ✅ Approve the **script** (Hinglish, one line per screen moment).
5. ✅ Approve the **audio** (`audio/mix/final_mix.mp3`).
6. Preview any step in Remotion Studio, ask for changes ("portion 05 at 0:12 — zoom more").
7. Get `exports/<slug>_<date>.mp4`, `exports/portions/*.mp4`, QC report and YouTube chapters.
   Upload to Drive → **How-to Videos / <Product>**.

## Cost per video (approx.)
| | Usage |
|---|---|
| Claude (Max plan) | ~250–400k tokens of context per video — included in the plan |
| ElevenLabs | ~2.7k characters per voice take; budget 6–9k with one revision |
| Epidemic Sound | shared company subscription (music edits) |
| Render | free, local, ~8 min |

## Folder map
- `.claude/skills/youtube-tutorial/` — the step-by-step procedure Claude follows (G1–G6)
- `CLAUDE.md` — house rules · `templates/` — brief + script templates
- `tools/` — pipeline commands · `engine/` — Remotion renderer (any product)
- `brand/` logos · `voice/` voice profile · `sfx/` house sound effects
- `videos/<slug>/` — one folder per tutorial (raw, audio, exports)
