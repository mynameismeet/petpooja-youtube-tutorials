# How to generate payslips in Attendo — portions (edit any part on its own) · v1 (1:59.9)

Open Studio (`cd engine && npx remotion studio`) → **attendo-payslip › AT-Portions** (or `tools/pipeline.sh studio`).
Rendered clips of every portion: `exports/portions/`.
Each portion is its own canvas + timeline (local time starts at 0:00). In **AT-Full**, double-click
a portion bar to jump into it at that frame. Changes in one portion show up in the full video too.

| Portion (Studio id) | In full video | Lines | What's on screen |
|---|---|---|---|
| AT-00-Intro-hook | 0:00.0 – 0:15.1 | L01–L03 | Attendo logo intro → dashboard flies in |
| AT-01-Open-Process-Payroll | 0:15.1 – 0:21.3 | L04–L06 | ☰ menu → Payroll → Process Payroll |
| AT-02-Group-dates | 0:21.3 – 0:34.0 | L07–L10 | group list (with / without compliance) → No Compliance → dates → Search |
| AT-03-Verify-employee-data | 0:34.0 – 0:44.7 | L11–L12 | employee table: days · paid days · wages → scroll to To Pay |
| AT-04-Finalize-payroll | 0:44.7 – 0:53.3 | L13–L14 | Finalize Payroll highlighted (not clicked) · "locks the payroll" |
| AT-05-Mark-as-paid | 0:53.3 – 1:19.5 | L15–L20 | Finalized Payroll Details → Test (Unpaid) → View Payroll → Mark As Paid → CONFIRM typed in capitals → Proceed → Test is Paid |
| AT-06-Download-salary-slip | 1:19.5 – 1:47.7 | L21–L27 | View Payroll → scroll to Action → ⋮ → Download Salary Slip → the payslip PDF (net payable ₹16,998) |
| AT-07-Outro | 1:47.7 – 1:59.9 | L28 | end card + subscribe |

## How to ask for a change
Say the portion + its local time (shown in Studio), e.g. *"AT-05 at 0:18 — type CONFIRM slower"*.
Everything lives in `engine/src/videos/attendo-payslip/edit.ts`:
- **SEGMENTS** — which footage plays when (holds / speed-ups), **CAMERA** — zooms,
- **HIGHLIGHTS** — blue rings + labels, **CHAPTERS** — step chips,
- **overlays / cursorScript** — the CONFIRM typing and the cursor on the confirm box (held frame).
Voice/music changes go back to G4 (`script.tts.json` → `tts.mjs` → `mix-audio.py`) — the edit follows automatically.

## YouTube chapters (each ≥ 10 s, so short steps are merged)
```
0:00 Intro
0:15 Open Process Payroll & choose the group
0:34 Verify employee data & finalize
0:53 Mark as paid
1:19 Download the salary slip
1:47 Wrap-up
```

## Footage notes
- Recorded by Claude in the user's Chrome over remote debugging (no screen recording from the user), 3 parts.
- Mark As Paid was clicked on the **Test** group (demo data, approved). CONFIRM + Proceed were done in Chrome
  directly, off-camera → recreated on the held confirm-box frame (typed text, enabled Proceed, cursor click).
- Finalize Payroll is shown but not clicked (no real data locked).
