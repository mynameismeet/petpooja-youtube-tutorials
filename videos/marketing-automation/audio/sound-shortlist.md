# Sound — decided: M3 "Morning Rises" (Airae)

## Why M3 over M1 (measured on the previews)
| | M1 Moving Up | **M3 Morning Rises** |
|---|---|---|
| Tempo | 110 BPM → 16.4 frames/beat | **120 BPM → exactly 15 frames/beat at 30 fps** |
| Highs (>5 kHz, hiss vs. female voice) | −33.8 dB | **−37.9 dB (softer, voice stays clear)** |
| Shape | full energy from 0:20 | **gentle build 0:15–0:35, breakdown 1:45–2:05, lift ~2:05** |

Our camera moves are 1 s eases = exactly 2 beats of M3, so zooms and step chips sit on the beat.
Arrangement (Epidemic track editor, cut to the final audio length):
- soft intro + build under the logo and onboarding,
- the **breakdown under "AI is designing your ad"**, the **lift landing on "Aur ye raha aapka ad!"**,
- resolve + 4 s fade on the end card. Bed sits −18 dB under the voice and ducks while she speaks.

ID `07d33825-eeda-32f9-92f6-b650a2da5216` · preview https://audiocdn.epidemicsound.com/lqmp3/01KK0XDE7QMP1JPGEQFQBTP1XM.mp3
(M1 kept as backup: `72ead9c2-60c5-4e9f-9f5d-bbdb4aeaaca3`)

## SFX — every one is a match cut
Each sound fires on the exact frame of its screen event; the voice word and the on-screen click
are aligned to the same moment (word timings from ElevenLabs → `timeline.json` → video retime).

| Cue | Effect (Epidemic) | Fires on | Preview |
|---|---|---|---|
| `click` | UI Click, Confirm, Dull (0.3 s) | the click frame of: Meta Platforms, Aesthetic, Loud, Retro, Let AI decide, Let's Create Ad, Re-engage chip, submit, Style 2, Go ahead, Proceed, Call Now, Add, Next, Pay & Launch | https://audiocdn.epidemicsound.com/lqmp3/01KK1V6TCH3F2VDNFF9JEPW165.mp3 |
| `whoosh` | Whoosh, Soft Resonant (0.6 s) | screen fly-in + each step chip entrance | https://audiocdn.epidemicsound.com/lqmp3/01KK1JVF057SK6R49B2X45P0HZ.mp3 |
| `riser` | Riser, Transition, Fast, Clean (4.4 s) | ENDS on the ad-reveal cut | https://audiocdn.epidemicsound.com/lqmp3/01KJWHDTSTMDXM6KPDVSJFAWB9.mp3 |
| `success` | Completions, Melodic, Success (1.2 s) | ad reveal · after Pay & Launch | https://audiocdn.epidemicsound.com/lqmp3/01KK1V6T4TDW3M21W85AHJWWPF.mp3 |

IDs: click `46216b97-17a4-48ec-a7ec-999132ef096a` · whoosh `3eb43b90-168b-404b-b6c2-28c69e53754b` ·
riser `7ab8bf54-dd59-49ac-9f98-2a27ed8539be` · success `aaa20ea0-8cdc-4c8f-991b-c58a94c0d130`
