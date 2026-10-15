import { interpolate } from "remotion";
import { useGlobalFrame } from "../GlobalTime";
import { cursorAt, type StageOverlay } from "../lib/video";
import { accentOf, FONT } from "../theme";
import { useVideo } from "../VideoContext";

// Drawn INSIDE the stage's zoomed screen, so everything here is in source px and moves with the camera.

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const CURSOR_H = 46; // source px (≈ a macOS pointer at 2× DPR)

const Pointer: React.FC<{ x: number; y: number; press: number }> = ({ x, y, press }) => (
  <svg
    width={CURSOR_H * 0.72}
    height={CURSOR_H}
    viewBox="0 0 18 25"
    style={{ position: "absolute", left: x - 2, top: y - 2, scale: String(1 - 0.12 * press), transformOrigin: "2px 2px",
      filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.35))" }}
  >
    <path d="M1 1 L1 20 L5.6 15.6 L8.7 23 L12 21.6 L8.9 14.4 L15.4 14.4 Z" fill="#111" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
  </svg>
);

const Overlay: React.FC<{ o: StageOverlay; t: number; fps: number }> = ({ o, t }) => {
  if (t < o.t0 || t > o.until) return null;
  const [x1, y1, x2, y2] = o.rect;
  const box = { position: "absolute" as const, left: x1, top: y1, width: x2 - x1, height: y2 - y1 };
  if (o.kind === "button") {
    const on = interpolate(t, [o.t0, o.t0 + 0.2], [0, 1], clamp);
    return (
      <div style={{ ...box, opacity: on, borderRadius: 10, backgroundColor: o.bg, color: o.color, fontFamily: FONT,
        fontSize: o.size, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {o.label}
      </div>
    );
  }
  // typed text: one character every (t1 - t0) / length seconds, caret blinks while typing / after
  const n = Math.floor(interpolate(t, [o.t0, o.t1], [0, o.text.length], clamp) + 1e-6);
  const caretOn = t < o.t1 + 0.3 || Math.floor(t * 2) % 2 === 0;
  return (
    <div style={{ ...box, borderRadius: 10, backgroundColor: "#fff", border: `3px solid ${o.focus ?? "#86b7fe"}`,
      boxShadow: `0 0 0 6px ${o.focus ? o.focus + "33" : "rgba(13,110,253,0.18)"}`, display: "flex", alignItems: "center",
      paddingLeft: 14, fontFamily: FONT, fontSize: o.size, fontWeight: 600, color: "#1f2933", letterSpacing: 1 }}>
      <span>{o.text.slice(0, n)}</span>
      <span style={{ width: 3, height: o.size * 1.15, marginLeft: 3, backgroundColor: "#1f2933", opacity: caretOn ? 1 : 0 }} />
    </div>
  );
};

export const StageExtras: React.FC = () => {
  const v = useVideo();
  const frame = useGlobalFrame();
  const t = frame / v.fps;
  const { accent } = accentOf(v.theme);
  const pos = v.cursor || v.cursorScript ? cursorAt(v, frame) : null;
  const ripples = v.clickFrames.filter((c) => frame >= c.f && frame < c.f + 16);
  const press = Math.max(0, ...v.clickFrames.map((c) => interpolate(frame, [c.f - 3, c.f, c.f + 5], [0, 1, 0], clamp)));
  return (
    <>
      {(v.overlays ?? []).map((o, i) => (
        <Overlay key={i} o={o} t={t} fps={v.fps} />
      ))}
      {ripples.map((c) => {
        const k = (frame - c.f) / 16;
        return (
          <div key={c.f} style={{ position: "absolute", left: c.x, top: c.y, width: 0, height: 0 }}>
            <div style={{ position: "absolute", left: -60 * k - 14, top: -60 * k - 14, width: 120 * k + 28, height: 120 * k + 28,
              borderRadius: "50%", border: `5px solid ${accent}`, opacity: 0.9 * (1 - k) }} />
          </div>
        );
      })}
      {pos ? <Pointer x={pos.x} y={pos.y} press={press} /> : null}
    </>
  );
};
