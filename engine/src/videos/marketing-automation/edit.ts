// Edit decision list for "Meta Ads with AI" (worked example) — AUDIO FIRST.
// Output times come from the locked audio (timing.ts): a line start, or the exact
// moment a click SFX fires on its spoken word. Source times are seconds in
// public/marketing-automation/screen.mp4 (HQ take, 2560×1602, 30 fps).
// Copy this file to start a new video (see .claude/skills/youtube-tutorial).
import { buildVideo, clickIn, type CameraKey, type Chapter, type Highlight, type Picks, type Segment } from "../../lib/video";
import { AUDIO_DURATION, LINES as L, SFX } from "./timing";

const SRC_W = 2560;
const SRC_H = 1602;
const click = (id: keyof typeof L) => clickIn(L, SFX, id);

const STAGE_IN = L.L02.start; // screen flies in (whoosh)
const OUTRO_START = L.L32.end; // end card fades in

// ---------------------------------------------------------------------------
// 1. Footage. Each segment pins src [a,b] to out [A,B].
//    Longer output → plays at 1x around a freeze on `hold` (src time).
//    Shorter output → speeds up; `badge` shows a fast-forward pill.
// ---------------------------------------------------------------------------
const PROMPT_PT1_END = L.L14.start + 6.23;
const REPLY_AT = L.L19.start + 1.36;
const CUSTOM_AT = L.L29.start + 0.43;
const PROCESSING_END = click("L31") + 0.56;

const SEGMENTS: Segment[] = [
  { label: "Dashboard → Meta Platforms", src: [45.2, 46.45], out: [STAGE_IN, click("L04")], hold: 45.2 },
  { label: "Offer campaigns → Aesthetic", src: [1.25, 4.45], out: [click("L04"), click("L06")], hold: 1.6 },
  { label: "New launch → Loud", src: [4.45, 8.72], out: [click("L06"), click("L07")] },
  { label: "Festival → Retro", src: [8.72, 12.35], out: [click("L07"), click("L08")] },
  { label: "Everything else → Let AI decide", src: [12.35, 15.05], out: [click("L08"), click("L09")], hold: 12.7 },
  { label: "Logo & colours", src: [15.05, 20.8], out: [click("L09"), L.L11.start + 0.6], hold: 15.45 },
  { label: "Fonts → Let's Create Ad", src: [20.8, 24.12], out: [L.L11.start + 0.6, click("L12")], hold: 23.85 },
  { label: "Getting to know your restaurant", src: [24.12, 38.77], out: [click("L12"), L.L14.start] },
  { label: "Prompt screen (part 1)", src: [38.77, 45.0], out: [L.L14.start, PROMPT_PT1_END] },
  { label: "Prompt screen → Re-engage chip", src: [51.0, 53.0], out: [PROMPT_PT1_END, click("L17")], hold: 51.0 },
  { label: "AI-written prompt", src: [53.0, 58.5], out: [click("L17"), L.L18.start] },
  { label: "Editing the offer → submit", src: [58.5, 87.0], out: [L.L18.start, click("L18")], badge: "Editing the prompt" },
  { label: "AI is thinking", src: [87.0, 112.9], out: [click("L18"), REPLY_AT], badge: "AI is thinking" },
  { label: "AI reply + styles → Style 2", src: [112.9, 115.4], out: [REPLY_AT, click("L20")], hold: 113.7 },
  { label: "Got it → Go ahead", src: [115.4, 118.43], out: [click("L20"), click("L21")], hold: 117.5 },
  { label: "Creating Meta Ad", src: [118.43, 186.53], out: [click("L21"), L.L23.start], badge: "AI is designing your ad" },
  { label: "Ad ready → Proceed", src: [186.53, 192.99], out: [L.L23.start, click("L24")], hold: 187.0 },
  { label: "Ad content → Call Now", src: [192.99, 203.85], out: [click("L24"), click("L26")], hold: 193.4 },
  { label: "Phone, location drawer → Add", src: [203.85, 218.79], out: [click("L26"), click("L27")] },
  { label: "Budget cards", src: [218.79, 224.43], out: [click("L27"), CUSTOM_AT], hold: 219.3 },
  { label: "Custom budget → Next", src: [224.43, 227.02], out: [CUSTOM_AT, click("L29")], hold: 225.6 },
  { label: "Review (summary expanded) → Pay & Launch", src: [227.02, 234.94], out: [click("L29"), click("L31")], hold: 229.6 },
  { label: "Processing", src: [234.94, 235.5], out: [click("L31"), PROCESSING_END] },
  { label: "Final hold (cut before payment popup)", src: [235.5, 235.5], out: [PROCESSING_END, OUTRO_START + 0.7], hold: 235.5 },
];

// ---------------------------------------------------------------------------
// 2. Camera: zoom (1 = whole screen) and focus point in source px.
// ---------------------------------------------------------------------------
const FULL = { z: 1, x: SRC_W / 2, y: SRC_H / 2 };

const CAMERA: CameraKey[] = [
  { t: 0, ...FULL },
  { t: STAGE_IN + 0.5, z: 1.35, x: 1300, y: 760, d: 4 },
  { t: L.L04.start - 0.2, z: 2.2, x: 600, y: 450, d: 1.1 },
  { t: L.L04.start + 2.3, z: 2.2, x: 1196, y: 1045, d: 1.1 },
  { t: click("L04") + 0.05, z: 1.45, x: 1800, y: 820, d: 0.9 },
  { t: click("L08") + 0.5, z: 1.45, x: 1800, y: 1150, d: 0.8 },
  { t: click("L09") + 0.1, z: 1.7, x: 1810, y: 560, d: 1.0 },
  { t: L.L11.start, z: 1.8, x: 1810, y: 1150, d: 1.0 },
  { t: click("L12") + 0.1, z: 1.5, x: 1293, y: 800, d: 0.9 },
  { t: L.L14.start, z: 1.3, x: 1291, y: 760, d: 0.9 },
  { t: L.L15.start, z: 1.7, x: 1291, y: 1010, d: 1.0 },
  { t: L.L17.start - 0.3, z: 2.1, x: 1450, y: 1000, d: 1.0 },
  { t: click("L17") + 0.1, z: 1.9, x: 1291, y: 760, d: 0.9 },
  { t: L.L18.start, z: 2.3, x: 1150, y: 720, d: 1.0 },
  { t: click("L18") - 1.0, z: 2.0, x: 1500, y: 780, d: 0.8 },
  { t: click("L18") + 0.2, z: 1.6, x: 1300, y: 500, d: 0.9 },
  { t: REPLY_AT, z: 1.9, x: 1270, y: 560, d: 1.0 },
  { t: L.L20.start, z: 2.0, x: 940, y: 740, d: 1.0 },
  { t: click("L20") + 0.1, z: 1.7, x: 1290, y: 950, d: 0.9 },
  { t: click("L21") + 0.2, z: 1.1, x: 1280, y: 800, d: 1.0 },
  { t: L.L23.start - 1.4, z: 1.9, x: 2240, y: 560, d: 1.3 },
  { t: L.L23.start + 4.7, z: 1.9, x: 2240, y: 1150, d: 1.0 },
  { t: click("L24") + 0.1, z: 1.15, x: 1280, y: 800, d: 0.7 },
  { t: L.L25.start, z: 1.7, x: 870, y: 520, d: 1.0 },
  { t: L.L26.start, z: 1.9, x: 600, y: 900, d: 1.0 },
  { t: L.L27.start + 0.4, z: 1.5, x: 1920, y: 800, d: 0.9 },
  { t: click("L27") - 1.7, z: 1.5, x: 1920, y: 1150, d: 0.6 },
  { t: click("L27") + 0.2, z: 1.6, x: 870, y: 900, d: 0.9 },
  { t: CUSTOM_AT, z: 1.4, x: 1920, y: 700, d: 0.6 },
  { t: CUSTOM_AT + 1.1, z: 1.6, x: 870, y: 900, d: 0.7 },
  { t: click("L29") - 1.4, z: 1.6, x: 1100, y: 1250, d: 0.8 },
  { t: click("L29") + 0.1, z: 1.4, x: 1280, y: 800, d: 0.8 },
  { t: L.L30.start + 0.2, z: 1.8, x: 880, y: 450, d: 1.0 },
  { t: L.L30.start + 6.7, z: 1.6, x: 1000, y: 1000, d: 0.9 },
  { t: L.L31.start, z: 2.2, x: 1500, y: 1350, d: 0.8 },
  { t: L.L32.start - 0.2, z: 1.75, x: 2160, y: 850, d: 1.4 },
];

// ---------------------------------------------------------------------------
// 3. Highlight rings: rect = [x1, y1, x2, y2] in source px, times in output s.
// ---------------------------------------------------------------------------
const HIGHLIGHTS: Highlight[] = [
  { t0: L.L04.start + 0.5, t1: L.L04.start + 2.2, rect: [20, 223, 353, 276], label: "Advertisements" },
  { t0: L.L04.start + 2.6, t1: click("L04"), rect: [942, 781, 1449, 1308], label: "Meta Platforms" },
  { t0: L.L06.start + 0.6, t1: click("L06"), rect: [1810, 294, 2342, 883] },
  { t0: click("L06") + 0.4, t1: click("L07"), rect: [1252, 914, 1784, 1503] },
  { t0: click("L07") + 0.4, t1: click("L08"), rect: [1810, 914, 2342, 1503] },
  { t0: click("L08") + 0.8, t1: click("L09"), rect: [1252, 1528, 2342, 1578], label: "Let AI decide", below: false },
  { t0: L.L10.start + 0.3, t1: L.L10.end, rect: [1257, 440, 2358, 985], label: "Logo & brand colours" },
  { t0: L.L11.start + 0.6, t1: L.L11.end, rect: [1257, 995, 2358, 1272], label: "Heading: Anton  ·  Body: Barlow" },
  { t0: L.L12.start + 0.6, t1: click("L12"), rect: [1682, 1306, 1935, 1364], label: "Let's Create Ad" },
  { t0: L.L15.start + 0.5, t1: L.L15.end, rect: [500, 940, 2085, 1112], label: "Quick campaign ideas" },
  { t0: L.L16.start + 0.2, t1: L.L16.end, rect: [1072, 1198, 1514, 1279], label: "Or start from your own creative" },
  { t0: L.L17.start + 0.2, t1: click("L17"), rect: [1328, 942, 1746, 1022], label: "Re-engage lapsed customers" },
  { t0: click("L17") + 1.0, t1: L.L17.end, rect: [637, 610, 1948, 904], label: "AI-written campaign prompt" },
  { t0: click("L18") - 0.9, t1: click("L18"), rect: [1852, 808, 1912, 868], label: "Submit" },
  { t0: REPLY_AT + 0.8, t1: L.L19.end, rect: [526, 328, 2006, 420], label: "AI understood the idea" },
  { t0: click("L20") - 2.0, t1: click("L20"), rect: [801, 420, 1082, 743], label: "Style 2" },
  { t0: click("L21") - 1.8, t1: click("L21"), rect: [525, 1032, 696, 1111], label: "Go ahead" },
  { t0: L.L23.start + 0.25, t1: L.L23.start + 4.5, rect: [1951, 154, 2524, 729], label: "AI-generated creative" },
  { t0: L.L23.start + 5.2, t1: L.L23.end, rect: [1951, 935, 2524, 1340], label: "Caption & headline" },
  { t0: click("L24") - 1.6, t1: click("L24"), rect: [2322, 1462, 2524, 1541], label: "Proceed" },
  { t0: L.L25.start + 0.6, t1: L.L25.start + 4.4, rect: [92, 279, 1656, 700], label: "Edit the AI copy anytime" },
  { t0: L.L25.start + 4.6, t1: L.L25.end, rect: [1421, 187, 1656, 266], label: "Regenerate with AI" },
  { t0: click("L26") - 1.8, t1: click("L26"), rect: [272, 822, 438, 903], label: "Call Now" },
  { t0: L.L27.start + 1.2, t1: click("L27") - 1.6, rect: [1319, 243, 2555, 330], label: "Search & add locations" },
  { t0: click("L27") - 1.3, t1: click("L27"), rect: [2448, 1510, 2538, 1584], label: "Add" },
  { t0: click("L27") + 0.6, t1: L.L28.start, rect: [92, 617, 816, 701], label: "2 locations added" },
  { t0: L.L28.start + 0.6, t1: L.L28.end, rect: [92, 832, 1656, 1034], label: "Budget + estimated impressions" },
  { t0: CUSTOM_AT + 0.1, t1: CUSTOM_AT + 0.9, rect: [1731, 282, 2404, 450], label: "Custom amount" },
  { t0: CUSTOM_AT + 1.6, t1: CUSTOM_AT + 3.6, rect: [617, 832, 1134, 1034], label: "₹15,000 · 6.25L impressions" },
  { t0: CUSTOM_AT + 3.8, t1: click("L29") - 1.5, rect: [92, 1257, 1656, 1395], label: "Runs 14–21 Oct" },
  { t0: click("L29") - 1.2, t1: click("L29"), rect: [1540, 1478, 1716, 1540], label: "Next" },
  { t0: L.L30.start + 1.2, t1: L.L30.start + 6.6, rect: [67, 162, 1705, 729], label: "Headline · CTA · location · amount" },
  { t0: L.L30.start + 7.2, t1: L.L30.end, rect: [77, 586, 1695, 886], label: "Total incl. 18% GST" },
  { t0: L.L31.start + 0.2, t1: click("L31"), rect: [1493, 1468, 1705, 1550], label: "Pay & Launch" },
  { t0: L.L32.start + 0.8, t1: OUTRO_START - 0.2, rect: [1885, 288, 2435, 1410] },
];

// ---------------------------------------------------------------------------
// 4. Chapters (step chips + YouTube chapters), onboarding picks
// ---------------------------------------------------------------------------
const CHAPTERS: Chapter[] = [
  { t: L.L04.start, title: "Open Meta Platforms" },
  { t: L.L05.start, title: "Choose your creative styles" },
  { t: L.L10.start, title: "Add your brand identity" },
  { t: L.L14.start, title: "Describe your campaign" },
  { t: L.L19.start, title: "Let AI build your ad" },
  { t: L.L25.start, title: "Edit copy, CTA & location" },
  { t: L.L28.start, title: "Set budget & schedule" },
  { t: L.L30.start, title: "Review, pay & launch" },
];

const PICKS: Picks = {
  t0: L.L05.start + 0.4,
  t1: click("L09") + 1.6,
  rows: [
    { t: click("L06"), campaign: "Offer campaigns", choice: "Aesthetic" },
    { t: click("L07"), campaign: "New launches", choice: "Loud" },
    { t: click("L08"), campaign: "Festival ads", choice: "Retro" },
    { t: click("L09"), campaign: "Everything else", choice: "Let AI decide" },
  ],
};

// ---------------------------------------------------------------------------
// 5. Portions — each opens as its own composition in Studio (folder "MA-Portions").
// ---------------------------------------------------------------------------
const PORTIONS = [
  { id: "00", name: "Intro & hook", start: 0, end: L.L04.start },
  { id: "01", name: "Open Meta Platforms", start: L.L04.start, end: L.L05.start },
  { id: "02", name: "Creative styles", start: L.L05.start, end: L.L10.start },
  { id: "03", name: "Brand identity", start: L.L10.start, end: L.L14.start },
  { id: "04", name: "Describe campaign", start: L.L14.start, end: L.L19.start },
  { id: "05", name: "AI builds the ad", start: L.L19.start, end: L.L25.start },
  { id: "06", name: "Copy, CTA & location", start: L.L25.start, end: L.L28.start },
  { id: "07", name: "Budget & schedule", start: L.L28.start, end: L.L30.start },
  { id: "08", name: "Review, pay & launch", start: L.L30.start, end: OUTRO_START },
  { id: "09", name: "Outro", start: OUTRO_START, end: AUDIO_DURATION },
];


export const VIDEO = buildVideo({
  slug: "marketing-automation",
  prefix: "MA",
  srcW: SRC_W,
  srcH: SRC_H,
  audioDuration: AUDIO_DURATION,
  stageIn: STAGE_IN,
  outroStart: OUTRO_START,
  logo: "brand/petpooja-marketing-automation-white.svg",
  copy: {
    introTitle: ["Create Meta Ads", "with AI"],
    gradientWord: "AI",
    pills: ["Prompt", "Creative", "Copy", "Budget", "Launch"],
    outroHeadline: "Aapka Meta ad ready hai!",
    outroSub: "Prompt se launch tak, sirf kuch minutes mein",
    subscribeLine: "Aise aur tutorials ke liye",
  },
  segments: SEGMENTS,
  camera: CAMERA,
  highlights: HIGHLIGHTS,
  chapters: CHAPTERS,
  picks: PICKS,
  portions: PORTIONS,
});
