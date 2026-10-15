import { AbsoluteFill, Easing, interpolate } from "remotion";
import { cameraAt, toScreen } from "../camera";
import { useGlobalFrame } from "../GlobalTime";
import { accentOf, COLORS, VIDEO_W } from "../theme";
import type { Highlight, VideoEdit } from "../lib/video";
import { useVideo } from "../VideoContext";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const PAD = 12;

const Ring: React.FC<{ v: VideoEdit; h: Highlight; frame: number }> = ({ v, h, frame }) => {
  const f0 = Math.round(h.t0 * v.fps);
  const f1 = Math.round(h.t1 * v.fps);
  if (frame < f0 || frame > f1 + 10) return null;

  const r = toScreen(cameraAt(v, frame), h.rect);
  const { accent, glow } = accentOf(v.theme);
  const appear = interpolate(frame, [f0, f0 + 12], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const visible = Math.min(appear, interpolate(frame, [f1, f1 + 10], [1, 0], clamp));
  const left = r.x - PAD;
  const top = r.y - PAD;
  const width = r.w + PAD * 2;
  const height = r.h + PAD * 2;
  const above = !h.below && top > 110;
  const cx = Math.min(VIDEO_W - 330, Math.max(330, left + width / 2));

  return (
    <>
      <div
        style={{
          position: "absolute",
          left,
          top,
          width,
          height,
          borderRadius: 16,
          border: `4px solid ${accent}`,
          boxShadow: `0 0 0 9999px rgba(4, 10, 28, ${0.3 * visible}), 0 0 32px ${glow}`,
          opacity: visible,
          scale: String(interpolate(appear, [0, 1], [1.12, 1])),
        }}
      />
      {h.label ? (
        <div
          style={{
            position: "absolute",
            left: cx,
            top: above ? top - 18 : top + height + 18,
            translate: above ? "-50% -100%" : "-50% 0%",
            opacity: visible,
            scale: String(interpolate(appear, [0, 1], [0.85, 1])),
            backgroundColor: accent,
            color: COLORS.white,
            fontSize: 32,
            fontWeight: 700,
            padding: "12px 26px",
            borderRadius: 999,
            whiteSpace: "nowrap",
            boxShadow: "0 12px 36px rgba(0, 0, 0, 0.35)",
          }}
        >
          {h.label}
        </div>
      ) : null}
    </>
  );
};

export const Highlights: React.FC = () => {
  const v = useVideo();
  const frame = useGlobalFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {v.highlights.map((h, i) => (
        <Ring key={i} v={v} h={h} frame={frame} />
      ))}
    </AbsoluteFill>
  );
};
