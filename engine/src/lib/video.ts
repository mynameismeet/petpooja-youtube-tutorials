// Shared kit for every tutorial. A video's edit.ts describes footage, camera,
// highlights and chapters in OUTPUT seconds (from the locked audio) and calls
// buildVideo(). The engine renders any VideoEdit — nothing below is product-specific.

export type Rect = [number, number, number, number];
/** src/out pin footage to the audio; `image` (public path under the video's folder) shows a still
 *  picture instead of the screen for the whole `out` range — e.g. a downloaded PDF. */
export type Segment = { label: string; src: [number, number]; out: [number, number]; hold?: number; badge?: string; image?: string };
export type CameraKey = { t: number; z: number; x: number; y: number; d?: number };
export type Highlight = { t0: number; t1: number; rect: Rect; label?: string; below?: boolean };
export type Chapter = { t: number; title: string };
export type Picks = { t0: number; t1: number; title?: string; heading?: string; rows: { t: number; campaign: string; choice: string }[] };
export type Clip = { label: string; f0: number; f1: number; srcFrame: number; rate: number; still?: string; image?: boolean };
/** Mouse path of a Claude-recorded walkthrough (tools/cursor-path.py): source seconds, source px. */
export type CursorPath = { moves: { t0: number; t1: number; x: number; y: number }[]; clicks: { t: number; x: number; y: number }[] };
/** Cursor moves acted out over a hold (output seconds, source px): glides to x,y, arriving at t. */
export type CursorKey = { t: number; x: number; y: number; click?: boolean };
/** Things drawn on top of the screen, in source px, output seconds — e.g. text typed into a field
 *  on a held frame, or a button shown in its enabled state. Visible from t0 until `until`. */
export type StageOverlay =
  | { kind: "type"; t0: number; t1: number; until: number; rect: Rect; text: string; size: number; focus?: string }
  | { kind: "button"; t0: number; until: number; rect: Rect; label: string; size: number; bg: string; color: string };
export type Theme = { accent: string; accentGlow: string; gradient: [string, string] };
export type Portion = { id: string; name: string; f0: number; dur: number };
export type Copy = {
  introTitle: [string, string]; // second line ends with the gradient word
  gradientWord: string;
  pills: string[];
  outroHeadline: string;
  outroSub: string;
  subscribeLine: string;
};

export type VideoInput = {
  slug: string; // folder name, e.g. "marketing-automation"
  prefix: string; // Studio id prefix, e.g. "MA"
  srcW: number;
  srcH: number;
  audioDuration: number;
  stageIn: number; // screen flies in (output s)
  outroStart: number; // end card fades in (output s)
  logo: string; // public path, white-wordmark variant for dark backgrounds
  copy: Copy;
  segments: Segment[];
  camera: CameraKey[];
  highlights: Highlight[];
  chapters: Chapter[];
  picks?: Picks;
  portions: { id: string; name: string; start: number; end: number }[];
  theme?: Theme; // accent colours (default: Petpooja red)
  cursor?: CursorPath; // draw a mouse pointer (recordings without one)
  cursorScript?: { t0: number; t1: number; keys: CursorKey[] }[];
  overlays?: StageOverlay[];
};

export type VideoEdit = Omit<VideoInput, "portions"> & {
  fps: number;
  screenSrc: string;
  audioSrc: string;
  totalFrames: number;
  clips: Clip[];
  holdTimes: number[];
  badges: { label: string; f0: number; f1: number; rate: number }[];
  portions: Portion[];
  clickFrames: { f: number; x: number; y: number }[]; // output frame of every cursor click (ripples)
};

export const FPS = 30;
const fr = (s: number) => Math.round(s * FPS);

/** Output time of the click SFX inside a line (= the moment the UI word is spoken). */
export const clickIn = (
  lines: Record<string, { start: number; end: number }>,
  sfx: readonly { name: string; at: number }[],
  id: string,
): number => {
  const l = lines[id];
  const s = sfx.find((x) => x.name === "click" && x.at >= l.start && x.at <= l.end + 0.05);
  if (!s) throw new Error(`no click SFX inside ${id}`);
  return s.at;
};

export const buildVideo = (v: VideoInput): VideoEdit => {
  const holdStill = (t: number) => `${v.slug}/holds/${Math.round(t * 1000)}.jpg`;
  const clips: Clip[] = [];
  const play = (label: string, a: number, b: number, A: number, B: number) => {
    const f0 = fr(A);
    const f1 = fr(B);
    if (f1 <= f0) return;
    clips.push({ label, f0, f1, srcFrame: fr(a), rate: Math.max(0.05, ((b - a) * FPS) / (f1 - f0)) });
  };
  for (const s of v.segments) {
    const [a, b] = s.src;
    const [A, B] = s.out;
    const p = s.hold;
    if (s.image) {
      clips.push({ label: s.label, f0: fr(A), f1: fr(B), srcFrame: -1, rate: 0, still: `${v.slug}/${s.image}`, image: true });
    } else if (p !== undefined && B - A > b - a + 0.05) {
      // longer output than footage: play to the hold point, freeze, play on so the click lands on B
      const pre = p - a;
      const post = b - p;
      play(`${s.label} · in`, a, p, A, A + pre);
      const h0 = fr(A + pre);
      const h1 = fr(B - post);
      if (h1 > h0) clips.push({ label: `${s.label} · hold`, f0: h0, f1: h1, srcFrame: fr(p), rate: 0, still: holdStill(p) });
      play(`${s.label} · out`, p, b, B - post, B);
    } else {
      play(s.label, a, b, A, B);
    }
  }
  // a recorded click shows where its source moment plays (clicks are pinned to segment ends)
  const clickFrames = (v.cursor?.clicks ?? []).flatMap((c) => {
    const at = c.t * FPS;
    const clip = clips.find((k) => !k.image && k.rate > 0 && at >= k.srcFrame - 0.5 && at <= k.srcFrame + (k.f1 - k.f0) * k.rate + 0.5);
    return clip ? [{ f: Math.round(clip.f0 + (at - clip.srcFrame) / clip.rate), x: c.x, y: c.y }] : [];
  });
  for (const s of v.cursorScript ?? []) for (const k of s.keys) if (k.click) clickFrames.push({ f: fr(k.t), x: k.x, y: k.y });

  return {
    ...v,
    fps: FPS,
    screenSrc: `${v.slug}/screen.mp4`,
    audioSrc: `${v.slug}/final_mix.wav`,
    totalFrames: fr(v.audioDuration),
    clips,
    clickFrames,
    holdTimes: [...new Set(v.segments.filter((s) => s.hold !== undefined && !s.image).map((s) => s.hold!))],
    badges: v.segments
      .filter((s) => s.badge)
      .map((s) => ({
        label: s.badge!,
        f0: fr(s.out[0]),
        f1: fr(s.out[1]),
        rate: Math.round((s.src[1] - s.src[0]) / (s.out[1] - s.out[0])),
      })),
    portions: v.portions.map((p) => ({ id: p.id, name: p.name, f0: fr(p.start), dur: fr(p.end) - fr(p.start) })),
  };
};

/** Source second shown at an output frame (null on image clips / before the first clip). */
export const srcTimeAt = (v: VideoEdit, frame: number): number | null => {
  const c = v.clips.find((k) => frame >= k.f0 && frame < k.f1) ?? (frame >= v.clips[v.clips.length - 1].f1 ? v.clips[v.clips.length - 1] : null);
  if (!c || c.image) return null;
  return (c.srcFrame + (Math.min(frame, c.f1) - c.f0) * c.rate) / FPS;
};

const smooth = (k: number) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));

/** Cursor position (source px) at an output frame, or null when it should be hidden. */
export const cursorAt = (v: VideoEdit, frame: number): { x: number; y: number } | null => {
  const t = frame / FPS;
  const script = (v.cursorScript ?? []).find((s) => t >= s.t0 && t <= s.t1);
  if (script) {
    const keys = script.keys;
    let i = keys.findIndex((k) => k.t > t);
    if (i === -1) return { x: keys[keys.length - 1].x, y: keys[keys.length - 1].y };
    if (i === 0) return { x: keys[0].x, y: keys[0].y };
    const a = keys[i - 1];
    const b = keys[i];
    const glide = Math.min(0.45, b.t - a.t); // glide in the last 0.45 s before arriving
    const e = smooth((t - (b.t - glide)) / glide);
    return { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e };
  }
  const s = srcTimeAt(v, frame);
  if (s === null || !v.cursor) return null;
  const m = v.cursor.moves;
  let i = -1;
  for (let k = 0; k < m.length; k++) if (m[k].t0 <= s) i = k;
  if (i < 0) return { x: m[0].x, y: m[0].y };
  const cur = m[i];
  const prev = m[Math.max(0, i - 1)];
  if (s >= cur.t1 || cur.t1 <= cur.t0) return { x: cur.x, y: cur.y };
  const e = smooth((s - cur.t0) / (cur.t1 - cur.t0));
  return { x: prev.x + (cur.x - prev.x) * e, y: prev.y + (cur.y - prev.y) * e };
};
