# Voice profile (house style for all tutorials)

Measured from `reference/attendo-register-tutorial.mp3` (1:49, English, Petpooja Payroll tutorial).

| Trait | Reference | Target for Hinglish VO |
|---|---|---|
| Voice | Female, bright, expressive — pitch ~267 Hz (range 182–364 Hz) | Warm Indian female, 25–35, friendly "helpful colleague", not salesy |
| Pace | ~137 words/min incl. pauses; ~10 words/sentence; voice active 69% of the time | Same. Hinglish runs slightly faster, so keep sentences short |
| Pauses | ~0.35 s at commas, ~0.65 s typical, 1.0–1.3 s between steps | `[p]` 0.35 · `[pp]` 0.65 · `[ppp]` 1.2 s |
| Emphasis | Lift on UI names and results ("*Edit Biometrics*", "*Done*") | `*word*` on buttons, menu names, outcomes |
| Music | Soft bed 16–20 dB under voice; fades ~4 s after the last line | −18 dB under voice, ducked when speaking, 4 s fade out |
| SFX | None prominent | Subtle only: soft click on key clicks, whoosh on step change, chime on success |
| Loudness | −18 LUFS, LRA 3.4 (compressed, even) | Master −14 LUFS (YouTube), −1.5 dBTP |

## Script shape (copy this every time)
1. Greeting + series name — "Hello everyone! Petpooja <Product> tutorials mein aapka swagat hai."
2. Problem → benefit in 2 short lines.
3. Navigation: "Shuru karne ke liye… left panel mein *X* par click kijiye."
4. Steps with connectors: "Ab…", "Phir…", "Yahan…". One action per sentence.
5. Tip with a reason ("…jitna zyada, utna better").
6. Success confirmation — say what the viewer will see.
7. CTA — "Aaj hi try kijiye *<Product>*… subscribe karna mat bhooliye!"

## ElevenLabs starting settings (`voice/voice.json`)
- Model `eleven_multilingual_v2` (stable Hinglish). Try `eleven_v3` if more expressiveness is needed.
- stability 0.45 · similarity 0.8 · style 0.35 · speaker boost on · speed 1.0
- Pick the voice by audition: `node tools/tts.mjs audition <slug> <voiceId1,voiceId2,voiceId3>`.
  Shortlist female voices with an Indian accent and a conversational/explainer tag.
- Generate line by line with `previous_text`/`next_text` (the tool does this) so tone stays continuous.
