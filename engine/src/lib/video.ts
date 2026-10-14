// Shared kit for every tutorial. A video's edit.ts describes footage, camera,
// highlights and chapters in OUTPUT seconds (from the locked audio) and calls
// buildVideo(). The engine renders any VideoEdit — nothing below is product-specific.

export type Rect = [number, number, number, number];
export type Segment = { label: string; src: [number, number]; out: [number, number]; hold?: number; badge?: string };
export type CameraKey = { t: number; z: number; x: number; y: number; d?: number };
export type Highlight = { t0: number; t1: number; rect: Rect; label?: string; below?: boolean };
export type Chapter = { t: number; title: string };
export type Picks = { t0: number; t1: number; title?: string; heading?: string; rows: { t: number; campaign: string; choice: string }[] };
export type Clip = { label: string; f0: number; f1: number; srcFrame: number; rate: number; still?: string };
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
    if (p !== undefined && B - A > b - a + 0.05) {
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
  return {
    ...v,
    fps: FPS,
    screenSrc: `${v.slug}/screen.mp4`,
    audioSrc: `${v.slug}/final_mix.wav`,
    totalFrames: fr(v.audioDuration),
    clips,
    holdTimes: [...new Set(v.segments.filter((s) => s.hold !== undefined).map((s) => s.hold!))],
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
