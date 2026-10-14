# Audio (G4) — approve this before any video render

**v2 status: ✅ approved & rendered** (exports/Meta-Ads-with-AI_Hinglish_1080p30_v2.mp4) · voice Anika (ElevenLabs, generated per SECTION as one take) · "Petpooja" spoken as पेट पूजा ·
music Morning Rises edit 2043305c (kick on the reveal at 2:01.07) · 3:17.8 · −14.2 LUFS · v1 kept in `vo/v1/`

| Folder | Contents |
|---|---|
| `vo/` | One ElevenLabs file per script line (`L01.mp3` …), plus `audition/` voice samples |
| `music/` | Background bed from Epidemic Sound (licensed), edited to the video length |
| `sfx/` | per-video overrides only — default is the house set in `/sfx` (`tools/make-sfx.sh`) |
| `mix/` | `final_mix.mp3` ← **listen to this** · stems `vo.wav` `music.wav` `sfx.wav` · `timeline.json` |

`timeline.json` holds the start/end of every line; the video edit (G5) is cut to it,
so once this mix is approved the video only needs one render.
