# Meta Ads with AI — portions (edit any part on its own) · v2 timing (3:17.8)

Open Studio (`cd engine && npx remotion studio`) → **Marketing-Automation › MA-Portions**.
Rendered clips of every portion: `exports/portions_v2/`.
Each portion is its own canvas + timeline (local time starts at 0:00). In **MA-Full**, double-click
a portion bar to jump into it at that frame. Changes in one portion show up in the full video too.

| Portion (Studio id) | In full video | Lines | What's on screen |
|---|---|---|---|
| MA-00-Intro-Hook | 0:00.0 – 0:21.9 | L01–L03 | logo intro → dashboard flies in |
| MA-01-Open-Meta | 0:21.9 – 0:29.2 | L04 | Advertisements → Meta Platforms click |
| MA-02-Creative-Styles | 0:29.2 – 0:48.6 | L05–L09 | Aesthetic / Loud / Retro / Let AI decide + checklist |
| MA-03-Brand-Identity | 0:48.6 – 1:08.3 | L10–L13 | logo & colours, Anton + Barlow, Let's Create Ad, loading |
| MA-04-Describe-Campaign | 1:08.3 – 1:36.8 | L14–L18 | quick ideas → Re-engage chip → edit prompt (5×) → submit |
| MA-05-AI-Builds-Ad | 1:36.8 – 2:11.9 | L19–L24 | thinking (7×) → Style 2 → Go ahead → designing (10×) → reveal → Proceed |
| MA-06-Copy-CTA-Location | 2:11.9 – 2:30.1 | L25–L27 | edit copy, Regenerate, Call Now, add locations |
| MA-07-Budget-Schedule | 2:30.1 – 2:44.7 | L28–L29 | budget cards, custom amount, ₹15,000, dates, Next |
| MA-08-Review-Launch | 2:44.7 – 3:04.9 | L30–L32 | summary, total, Pay & Launch, phone preview |
| MA-09-Outro | 3:04.9 – 3:17.8 | L33 | end card + subscribe |

## How to ask for a change
Say the portion + its local time (shown in Studio), e.g. *"MA-05 at 0:12 — zoom in more on the
styles"* or *"MA-07 — change the label to …"*. Everything lives in
`engine/src/videos/marketing-automation/edit.ts`:
- **SEGMENTS** — which footage plays when (holds / speed-ups), **CAMERA** — zooms,
- **HIGHLIGHTS** — red rings + labels, **CHAPTERS** — step chips, **PICKS** — onboarding checklist.
Voice/music changes go back to G4 (`script.tts.json` → `tts.mjs` → `mix-audio.py`) — the edit follows automatically.

## YouTube chapters
```
0:00 Intro & open Meta Platforms
0:29 Choose your creative styles
0:48 Add your brand identity
1:08 Describe your campaign
1:36 Let AI build your ad
2:11 Edit copy, CTA & location
2:30 Set budget & schedule
2:44 Review, pay & launch
```
