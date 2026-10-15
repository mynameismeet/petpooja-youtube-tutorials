# Audio — How to generate payslips in Attendo (locked 14 Oct 2026)

- **Voice:** Anika (`voice/voice.json`), ONE take for the whole script (`"take": "one"`), 111.6 s of speech.
  Section changes ≈ 1.1 s natural pauses inside the take; four too-short sentence gaps widened in silence only.
  Whisper QC: all 28 lines complete (Hindi + English passes). Attendo spoken in Latin ("अटेंडो"); Petpooja = पेट पूजा.
- **Music:** Epidemic Sound "Morning Rises" (Airae), edit 4c1aa31d (122.8 s, kick region 103–125 s of the track),
  `offset −2.899` → the lift lands on L25 "Aur ye rahi aapki payslip!" at 90.925 s (1 ms off). gain −23 dB,
  duck ratio 5, threshold 0.02 → voice ≥ 14.5 dB over the bed on every line (avg 24.8 dB).
- **SFX:** house set — 13 clicks on their spoken UI words, 7 whooshes (intro + chapter chips), success on
  "Ho gaya!", riser ending on the payslip reveal.
- **Master:** −14.3 LUFS integrated, −1.5 dBTP, 119.87 s → `mix/final_mix.wav` / `.mp3`, timeline in `mix/timeline.json`.
