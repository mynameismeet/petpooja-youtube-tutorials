import { AbsoluteFill, Easing, Img, interpolate, staticFile } from "remotion";
import { useGlobalFrame } from "../GlobalTime";
import { accentOf, COLORS } from "../theme";
import { useVideo } from "../VideoContext";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const smooth = Easing.bezier(0.16, 1, 0.3, 1);

/** Logo → two-line title (last word in gradient) → step pills. Lifts away as the screen flies in. */
export const Intro: React.FC = () => {
  const v = useVideo();
  const frame = useGlobalFrame();
  const end = Math.round(v.stageIn * v.fps);
  const rise = (delay: number) => interpolate(frame, [delay, delay + 22], [0, 1], { ...clamp, easing: smooth });
  const exit = interpolate(frame, [end - 16, end], [0, 1], { ...clamp, easing: Easing.bezier(0.55, 0, 1, 0.45) });
  const [line1, line2] = v.copy.introTitle;
  const before = line2.endsWith(v.copy.gradientWord) ? line2.slice(0, -v.copy.gradientWord.length) : line2 + " ";

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        color: COLORS.white,
        opacity: 1 - exit,
        translate: `0px ${-120 * exit}px`,
      }}
    >
      <Img
        src={staticFile(v.logo)}
        style={{
          height: 104,
          width: "auto",
          opacity: rise(2),
          scale: String(interpolate(rise(2), [0, 1], [0.85, 1])),
          translate: `0px ${interpolate(rise(2), [0, 1], [30, 0])}px`,
          filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.35))",
        }}
      />
      <div style={{ marginTop: 36, fontSize: 132, fontWeight: 800, lineHeight: 1.04, textAlign: "center", letterSpacing: -3 }}>
        <div style={{ opacity: rise(10), translate: `0px ${interpolate(rise(10), [0, 1], [50, 0])}px` }}>{line1}</div>
        <div style={{ opacity: rise(18), translate: `0px ${interpolate(rise(18), [0, 1], [50, 0])}px` }}>
          {before}
          <span
            style={{
              background: `linear-gradient(90deg, ${accentOf(v.theme).gradient[0]}, ${accentOf(v.theme).gradient[1]})`,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            {v.copy.gradientWord}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 52 }}>
        {v.copy.pills.map((s, i) => {
          const p = rise(32 + i * 6);
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div
                style={{
                  padding: "14px 28px",
                  borderRadius: 999,
                  backgroundColor: "rgba(255,255,255,0.10)",
                  border: `1.5px solid ${COLORS.glassBorder}`,
                  fontSize: 32,
                  fontWeight: 600,
                  opacity: p,
                  scale: String(interpolate(p, [0, 1], [0.8, 1])),
                }}
              >
                {s}
              </div>
              {i < v.copy.pills.length - 1 ? <div style={{ fontSize: 30, color: COLORS.textSoft, opacity: p }}>→</div> : null}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
