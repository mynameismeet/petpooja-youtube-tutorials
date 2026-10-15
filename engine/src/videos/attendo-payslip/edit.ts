// Edit decision list for "How to generate payslips in Attendo" — AUDIO FIRST.
// Output times come from the locked audio (timing.ts): a line start, a click SFX on its spoken word,
// or a word inside a line (W below, read from the ElevenLabs alignment). Source = public/attendo-payslip/
// screen.mp4: Claude's CDP recording, three parts joined (01 0–44.07 · 02 44.07–80.2 · 03 80.2–113.37 s),
// 2560×1284 (Chrome window 1440×722 CSS px × 1.778). No cursor in the capture → cursor.ts + StageExtras.
import { buildVideo, clickIn, type CameraKey, type Chapter, type Highlight, type Segment } from "../../lib/video";
import { CURSOR } from "./cursor";
import { AUDIO_DURATION, LINES as L, SFX } from "./timing";

const SRC_W = 2560;
const SRC_H = 1284;
const click = (id: keyof typeof L) => clickIn(L, SFX, id);

// words inside lines (output s) — from audio/vo/<id>.align.json
const W = {
  daysCols: 37.19, wages: 38.52, toPay: 39.22, finalize: 46.35, lock: 49.55,
  test: 60.78, unpaid: 61.83, dotsClick: 63.93, mark: 67.91,
  confirm: 70.59, capital: 71.76, phir: 73.22, paid: 76.83, action: 84.15,
  earnings: 93.28, netPayable: 94.86, employees: 98.59,
};

const STAGE_IN = L.L02.start; // screen flies in (whoosh)
const OUTRO_START = L.L27.end; // end card fades in under L28
const MODAL_END = click("L19") + 0.38; // Proceed → cut to the Paid list
const SCROLL_IN = W.wages - 0.22;

// ---------------------------------------------------------------------------
// 1. Footage: src [a,b] (source s) pinned to out [A,B] (output s).
// ---------------------------------------------------------------------------
const SEGMENTS: Segment[] = [
  { label: "Dashboard → menu", src: [1.0, 5.919], out: [STAGE_IN, click("L04")], hold: 3.2 },
  { label: "Menu → Payroll", src: [5.919, 7.655], out: [click("L04"), click("L05")] },
  { label: "Payroll → Process Payroll", src: [7.655, 9.61], out: [click("L05"), click("L06")] },
  { label: "Process Payroll loads → group dropdown", src: [9.61, 14.245], out: [click("L06"), click("L07")] },
  { label: "Group list → No Compliance", src: [14.245, 16.954], out: [click("L07"), click("L09")], hold: 15.3 },
  { label: "Dates → Search", src: [16.954, 21.009], out: [click("L09"), click("L10")] },
  { label: "Employee table", src: [21.009, 24.6], out: [click("L10"), SCROLL_IN], hold: 24.0 },
  // three horizontal scrolls, the pauses between them cut out
  { label: "Scroll 1", src: [25.6, 26.1], out: [SCROLL_IN, SCROLL_IN + 0.35] },
  { label: "Scroll 2", src: [27.55, 28.05], out: [SCROLL_IN + 0.35, SCROLL_IN + 0.7] },
  { label: "Scroll 3 → To Pay", src: [29.45, 30.35], out: [SCROLL_IN + 0.7, SCROLL_IN + 1.35] },
  { label: "Check · scroll back → Finalize", src: [30.35, 35.55], out: [SCROLL_IN + 1.35, W.finalize], hold: 30.4 },
  { label: "Finalize Payroll (shown, not clicked)", src: [35.55, 44.0], out: [W.finalize, L.L15.start] },
  { label: "Menu → Finalized Payroll Details", src: [48.6, 53.176], out: [L.L15.start, click("L15")] },
  { label: "Finalized payrolls → Test row ⋮", src: [53.176, 60.328], out: [click("L15"), W.dotsClick], hold: 58.3 },
  { label: "⋮ → View Payroll", src: [60.328, 62.376], out: [W.dotsClick, click("L17")] },
  { label: "View Payroll loads", src: [62.376, 62.9], out: [click("L17"), click("L17") + 0.45] },
  { label: "→ Mark As Paid", src: [68.6, 71.758], out: [click("L17") + 0.45, click("L18")] },
  { label: "Confirm box (CONFIRM typed as overlay)", src: [71.758, 72.8], out: [click("L18"), MODAL_END], hold: 72.8 },
  { label: "Test is Paid", src: [80.2, 83.641], out: [MODAL_END, L.L21.start + 0.2], hold: 81.0 },
  { label: "⋮ → View Payroll", src: [83.641, 85.602], out: [L.L21.start + 0.2, click("L21")] },
  { label: "View Payroll loads", src: [85.602, 86.1], out: [click("L21"), click("L21") + 0.4] },
  { label: "Scroll to Action", src: [89.4, 94.6], out: [click("L21") + 0.4, W.action + 0.05] },
  { label: "Action column → ⋮", src: [94.6, 98.978], out: [W.action + 0.05, click("L23")] },
  { label: "⋮ → Download Salary Slip", src: [98.978, 102.537], out: [click("L23"), click("L24")] },
  { label: "Downloaded", src: [102.537, 103.2], out: [click("L24"), L.L25.start], hold: 103.2 },
  { label: "The payslip (PDF)", src: [0, 0], out: [L.L25.start, OUTRO_START + 0.7], image: "payslip.jpg" },
];

// ---------------------------------------------------------------------------
// 2. Camera: zoom (1 = whole screen) and focus point in source px.
// ---------------------------------------------------------------------------
const FULL = { z: 1, x: SRC_W / 2, y: SRC_H / 2 };
const MODAL = { x: 1280, y: 720 }; // confirm box centre

const CAMERA: CameraKey[] = [
  { t: 0, ...FULL },
  { t: STAGE_IN + 0.5, z: 1.25, x: 1280, y: 560, d: 4 },
  { t: L.L04.start - 0.3, z: 1.75, x: 400, y: 380, d: 1.1 }, // ☰ menu
  { t: click("L04") + 0.3, z: 1.75, x: 400, y: 560, d: 0.8 }, // Payroll, Process Payroll (clear of the step chip)
  { t: click("L06") + 0.1, z: 1.25, x: 1280, y: 600, d: 0.9 },
  { t: L.L07.start, z: 1.9, x: 560, y: 430, d: 0.9 }, // group dropdown + list
  { t: click("L09") + 0.15, z: 1.75, x: 800, y: 330, d: 0.9 }, // dates + Search
  { t: click("L10") + 0.2, z: 1.15, x: 1280, y: 700, d: 1.0 },
  { t: W.daysCols - 0.5, z: 1.45, x: 1650, y: 720, d: 0.9 },
  { t: SCROLL_IN + 1.35, z: 1.45, x: 1750, y: 720, d: 0.6 }, // To Pay
  { t: L.L12.end - 2.4, z: 1.2, x: 1400, y: 640, d: 1.0 },
  { t: W.finalize - 0.6, z: 1.9, x: 2050, y: 330, d: 1.0 }, // Finalize Payroll
  { t: W.lock + 0.4, z: 1.6, x: 1950, y: 430, d: 1.2 },
  { t: L.L15.start, z: 1.55, x: 420, y: 470, d: 0.9 }, // ☰ menu
  { t: click("L15") - 1.25, z: 1.55, x: 420, y: 720, d: 0.5 }, // → Finalized Payroll Details (clear of the chip)
  { t: click("L15") + 0.15, z: 1.2, x: 1280, y: 642, d: 0.9 },
  { t: W.test - 0.6, z: 1.7, x: 1850, y: 800, d: 1.0 }, // Test row, status, ⋮
  { t: click("L17") + 0.1, z: 1.2, x: 1280, y: 642, d: 0.6 },
  { t: L.L18.start + 0.2, z: 1.85, x: 2000, y: 380, d: 0.9 }, // Mark As Paid
  { t: click("L18") + 0.1, z: 1.6, ...MODAL, d: 0.8 },
  { t: W.confirm - 0.4, z: 2.2, x: 1280, y: 780, d: 0.8 }, // the CONFIRM field
  { t: W.phir - 0.2, z: 2.0, x: 1450, y: 860, d: 0.7 }, // → Proceed
  { t: MODAL_END, z: 1.25, x: 1280, y: 642, d: 0.7 },
  { t: W.paid - 0.6, z: 1.8, x: 1900, y: 800, d: 0.9 }, // Test → Paid
  { t: click("L21") + 0.1, z: 1.15, x: 1280, y: 642, d: 0.7 },
  { t: L.L22.start + 0.3, z: 1.4, x: 1650, y: 520, d: 1.0 },
  { t: W.action - 0.3, z: 1.75, x: 2050, y: 520, d: 0.9 }, // Action column
  { t: L.L23.start + 0.6, z: 2.0, x: 2200, y: 600, d: 0.9 }, // ⋮ + Download Salary Slip
  { t: L.L25.start, z: 1.02, x: 1280, y: 642, d: 0.05 }, // payslip: whole page
  { t: L.L25.start + 0.7, z: 1.5, x: 1280, y: 330, d: 1.3 },
  { t: W.earnings - 0.3, z: 1.95, x: 1280, y: 540, d: 0.8 },
  { t: W.netPayable - 0.3, z: 2.3, x: 1280, y: 800, d: 0.8 },
  { t: L.L26.start + 0.2, z: 1.2, x: 1280, y: 600, d: 1.4 },
  { t: L.L27.start + 0.5, z: 1.08, x: 1280, y: 642, d: 2.0 },
];

// ---------------------------------------------------------------------------
// 3. Highlight rings: rect = [x1, y1, x2, y2] in source px, times in output s.
// ---------------------------------------------------------------------------
const TEST_ROW: [number, number, number, number] = [151, 747, 2514, 894];
const STATUS: [number, number, number, number] = [2330, 797, 2452, 848];
const VIEW_ITEM: [number, number, number, number] = [2234, 857, 2478, 924];
const CONFIRM_FIELD: [number, number, number, number] = [833, 702, 1727, 760];
const PROCEED: [number, number, number, number] = [1568, 922, 1727, 981];

const HIGHLIGHTS: Highlight[] = [
  { t0: click("L04") + 0.15, t1: click("L05"), rect: [18, 508, 425, 580], label: "Payroll" },
  { t0: click("L05") + 0.25, t1: click("L06"), rect: [69, 679, 423, 743], label: "Process Payroll" },
  { t0: L.L07.start + 0.3, t1: click("L07"), rect: [185, 254, 549, 313], label: "Payroll group" },
  { t0: click("L07") + 0.5, t1: L.L09.start, rect: [187, 324, 615, 587], label: "With or without compliance" },
  { t0: L.L09.start + 0.2, t1: click("L09"), rect: [187, 522, 615, 587], label: "No Compliance" },
  { t0: L.L10.start + 0.6, t1: L.L10.start + 1.7, rect: [578, 254, 1138, 313], label: "Payroll dates" },
  { t0: L.L10.start + 1.8, t1: click("L10"), rect: [1161, 254, 1321, 313], label: "Search" },
  { t0: W.daysCols - 0.1, t1: SCROLL_IN, rect: [1076, 395, 2409, 1129], label: "Days · paid days · wages" },
  { t0: SCROLL_IN + 1.4, t1: L.L12.end - 2.6, rect: [1863, 395, 2036, 1129], label: "To Pay" },
  { t0: W.finalize - 0.3, t1: W.lock - 0.15, rect: [2101, 254, 2308, 313], label: "Finalize Payroll" },
  { t0: W.lock, t1: L.L14.end - 0.2, rect: [2101, 254, 2308, 313], label: "Locks the payroll" },
  { t0: click("L15") - 1.0, t1: click("L15"), rect: [69, 871, 423, 932], label: "Finalized Payroll Details" },
  { t0: W.test - 0.15, t1: W.unpaid - 0.1, rect: TEST_ROW, label: "Test group" },
  { t0: W.unpaid, t1: W.dotsClick - 0.1, rect: STATUS, label: "Unpaid" },
  { t0: W.dotsClick + 0.35, t1: click("L17"), rect: VIEW_ITEM, label: "View Payroll" },
  { t0: W.mark - 0.3, t1: click("L18"), rect: [2117, 254, 2308, 313], label: "Mark As Paid" },
  { t0: W.capital - 0.25, t1: W.phir - 0.1, rect: CONFIRM_FIELD, label: "CONFIRM — capital letters", below: true },
  { t0: W.phir, t1: click("L19"), rect: PROCEED, label: "Proceed", below: true },
  { t0: W.paid - 0.2, t1: L.L20.end, rect: STATUS, label: "Paid" },
  { t0: L.L21.start + 0.55, t1: click("L21"), rect: [2011, 857, 2292, 925], label: "View Payroll" }, // paid: menu also has Release Payslip
  { t0: W.action + 0.15, t1: L.L22.end + 0.3, rect: [2196, 420, 2330, 1129], label: "Action" },
  { t0: click("L23") - 1.0, t1: click("L23"), rect: [2235, 512, 2295, 572] },
  { t0: click("L23") + 0.5, t1: click("L24"), rect: [2237, 578, 2522, 645], label: "Download Salary Slip", below: true },
  { t0: W.earnings - 0.1, t1: W.netPayable - 0.2, rect: [884, 422, 1673, 623], label: "Earnings & deductions" },
  { t0: W.netPayable, t1: L.L25.end, rect: [884, 786, 1673, 858], label: "Total Net Payable ₹16,998", below: true },
  { t0: W.employees - 0.1, t1: L.L26.end - 0.2, rect: [872, 150, 1688, 400], label: "Employees get it in the Attendo app too", below: true },
];

// ---------------------------------------------------------------------------
// 4. Chapters (step chips) and portions (Studio compositions, folder "AT-Portions")
// ---------------------------------------------------------------------------
const CHAPTERS: Chapter[] = [
  { t: L.L04.start, title: "Open Process Payroll" },
  { t: L.L07.start, title: "Choose group & dates" },
  { t: L.L11.start, title: "Verify employee data" },
  { t: L.L13.start, title: "Finalize payroll" },
  { t: L.L15.start, title: "Mark as paid" },
  { t: L.L21.start, title: "Download salary slip" },
];

const PORTIONS = [
  { id: "00", name: "Intro & hook", start: 0, end: L.L04.start },
  { id: "01", name: "Open Process Payroll", start: L.L04.start, end: L.L07.start },
  { id: "02", name: "Group & dates", start: L.L07.start, end: L.L11.start },
  { id: "03", name: "Verify employee data", start: L.L11.start, end: L.L13.start },
  { id: "04", name: "Finalize payroll", start: L.L13.start, end: L.L15.start },
  { id: "05", name: "Mark as paid", start: L.L15.start, end: L.L21.start },
  { id: "06", name: "Download salary slip", start: L.L21.start, end: OUTRO_START },
  { id: "07", name: "Outro", start: OUTRO_START, end: AUDIO_DURATION },
];

export const VIDEO = buildVideo({
  slug: "attendo-payslip",
  prefix: "AT",
  srcW: SRC_W,
  srcH: SRC_H,
  audioDuration: AUDIO_DURATION,
  stageIn: STAGE_IN,
  outroStart: OUTRO_START,
  logo: "brand/attendo-wordmark-white.png",
  theme: { accent: "#2F80ED", accentGlow: "rgba(47, 128, 237, 0.5)", gradient: ["#3D8BFF", "#7AD7FF"] },
  copy: {
    introTitle: ["Generate Payslips", "in Minutes"],
    gradientWord: "Minutes",
    pills: ["Process", "Verify", "Finalize", "Mark Paid", "Download"],
    outroHeadline: "Aapki payslip ready hai!",
    outroSub: "Payroll se payslip tak, sirf kuch clicks mein",
    subscribeLine: "Aise aur tutorials ke liye",
  },
  segments: SEGMENTS,
  camera: CAMERA,
  highlights: HIGHLIGHTS,
  chapters: CHAPTERS,
  portions: PORTIONS,
  cursor: CURSOR,
  // the confirm box is a held frame: the cursor clicks into the field, then on Proceed
  cursorScript: [
    {
      t0: click("L18") + 1.04,
      t1: MODAL_END,
      keys: [
        { t: click("L18") + 1.04, x: 2213, y: 284 },
        { t: W.confirm - 0.15, x: 1120, y: 731, click: true },
        { t: click("L19"), x: 1648, y: 951, click: true },
      ],
    },
  ],
  overlays: [
    { kind: "type", t0: W.confirm, t1: W.confirm + 0.95, until: MODAL_END, rect: CONFIRM_FIELD, text: "CONFIRM", size: 30 },
    { kind: "button", t0: W.confirm + 1.0, until: MODAL_END, rect: PROCEED, label: "Proceed", size: 30, bg: "#337AC2", color: "#ffffff" },
  ],
});
