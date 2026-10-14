import { AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { COLORS } from "../theme";
import { useVideo } from "../VideoContext";
import { Background } from "./Background";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const smooth = Easing.bezier(0.16, 1, 0.3, 1);

/** End card: logo, headline, subline, subscribe pill. Local frame 0 = end card start. */
export const Outro: React.FC = () => {
  const v = useVideo();
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 14], [0, 1], clamp);
  const rise = (delay: number) => interpolate(frame, [delay, delay + 22], [0, 1], { ...clamp, easing: smooth });
  const badge = interpolate(frame, [8, 30], [0, 1], { ...clamp, easing: Easing.spring({ damping: 12 }) });

  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <Background />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", color: COLORS.white }}>
        <Img
          src={staticFile(v.logo)}
          style={{ height: 96, width: "auto", scale: String(badge), filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.35))" }}
        />
        <div
          style={{
            marginTop: 34,
            fontSize: 92,
            fontWeight: 800,
            letterSpacing: -2,
            opacity: rise(14),
            translate: `0px ${interpolate(rise(14), [0, 1], [40, 0])}px`,
          }}
        >
          {v.copy.outroHeadline}
        </div>
        <div style={{ marginTop: 8, fontSize: 44, fontWeight: 600, color: COLORS.textSoft, opacity: rise(22) }}>
          {v.copy.outroSub}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginTop: 72,
            opacity: rise(34),
            scale: String(interpolate(rise(34), [0, 1], [0.9, 1])),
          }}
        >
          <div style={{ fontSize: 36, fontWeight: 600 }}>{v.copy.subscribeLine}</div>
          <div
            style={{
              padding: "16px 38px",
              borderRadius: 999,
              backgroundColor: COLORS.accent,
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: 2,
              boxShadow: `0 10px 40px ${COLORS.accentGlow}`,
            }}
          >
            SUBSCRIBE
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
