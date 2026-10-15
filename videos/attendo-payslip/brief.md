# Brief — Petpooja Attendo: How to generate payslip

- **Goal:** show a restaurant owner how to generate and download employee payslips in Attendo (formerly Petpooja Payroll).
- **Audience:** restaurant owners & managers in India; Hinglish; not tech experts.
- **Promise (1 line):** "<what becomes easy>"
- **CTA:** Try Petpooja Attendo today + subscribe.
- **Format:** YouTube 1920×1080 30 fps · Hinglish VO (Anika) · Morning Rises bed · target 2:30–3:30.
- **Logo:** `brand/attendo-wordmark.png` + `brand/attendo-icon.png` (white variants in `engine/public/brand/`).
- **Recording:** no user recording — Claude screen-records the Chrome walkthrough (payroll.petpooja.com, demo data, user logs in).
- **Process source:** `source/process-voice-note.aac` (user's explanation, transcribed below).
- **Mark as Paid:** approved on a TEST payroll group only — confirm the exact group with the user before clicking.
- **This take's picks (G2, recorded 14 Oct 2026):** Process Payroll → group *Monthly Payroll (No Compliance)*,
  01–13 Oct 2026 (Finalize hovered only) · Finalized Payroll Details → group *Test* (01–30 Sep 2026, ₹50,387,
  2 employees) → View Payroll → Mark As Paid → CONFIRM → Proceed (done in Chrome by the user, not recorded) →
  Paid → View Payroll → Action ⋮ (Ctc THREE) → Download Salary Slip → `source/payslip/Ctc_THREE_payslip.pdf`.
- **App order (follows the UI, not the voice note):** Finalize locks the data first; Mark As Paid comes after,
  inside Finalized Payroll Details → View Payroll; Download Salary Slip appears only once paid.
- **Do not show:** payment popups, QR codes, real phone numbers, anything sensitive.

## Flow (from the voice note → becomes chapters)
1. Prerequisite: employees onboarded into payroll groups (10–12 employee outlet example).
2. Payroll → pick the payroll group (with / without compliance) → employee list.
3. Verify each employee's data; correct anything before freezing.
4. **Mark as Paid** → payroll freezes (no more changes) → payslips are generated.
5. Finalize Payroll Details → open the payroll → **View Payroll** → scroll right → **Actions** → **Download Salary Slip**.
6. Bonus: employees can also download their own payslip from the Attendo employee app.
