# Drop the HQ screen recording here

- One or more parts, numbered in play order: `01 ….mov`, `02 ….mov`.
- Record at native resolution (Retina is fine). Any frame rate — it is conformed to 30 fps.
- No voice needed; the voiceover is generated from `script.md`.

`tools/analyze-recording.sh` joins the parts, crops the browser chrome and writes `source/screen.mp4`.
