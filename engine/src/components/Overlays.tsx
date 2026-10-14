import { AbsoluteFill, Easing, interpolate } from "remotion";
import { useGlobalFrame } from "../GlobalTime";
import { COLORS } from "../theme";
import { FPS } from "../lib/video";
import { useVideo } from "../VideoContext";

const at = (s: number) => Math.round(s * FPS);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const smooth = Easing.bezier(0.16, 1, 0.3, 1);

const CHIP_FRAMES = 135;

// ---------------------------------------------------------------------------
// "STEP 3 OF 8" chapter chips, bottom-left
// ---------------------------------------------------------------------------
export const ChapterChips: React.FC = () => {
  const { chapters: CHAPTERS, outroStart: OUTRO_START } = useVideo();
  const frame = useGlobalFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {CHAPTERS.map((c, i) => {
        const start = at(c.t);
        const end = Math.min(start + CHIP_FRAMES, at(OUTRO_START));
        if (frame < start || frame > end) {
          return null;
        }
        const appear = interpolate(frame, [start, start + 16], [0, 1], {
          ...clamp,
          easing: smooth,
        });
        const vanish = interpolate(frame, [end - 12, end], [1, 0], clamp);
        const visible = Math.min(appear, vanish);
        const number = String(i + 1).padStart(2, "0");
        return (
          <div
            key={c.title}
            style={{
              position: "absolute",
              left: 64,
              bottom: 64,
              display: "flex",
              alignItems: "center",
              gap: 22,
              padding: "18px 36px 18px 18px",
              backgroundColor: COLORS.glass,
              border: `1.5px solid ${COLORS.glassBorder}`,
              borderRadius: 24,
              backdropFilter: "blur(16px)",
              boxShadow: "0 18px 50px rgba(0, 0, 0, 0.4)",
              opacity: visible,
              translate: `${interpolate(appear, [0, 1], [-80, 0])}px 0px`,
            }}
          >
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: 18,
                backgroundColor: COLORS.accent,
                color: COLORS.white,
                fontSize: 36,
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {number}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div
                style={{
                  color: COLORS.textSoft,
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: 3,
                }}
              >
                STEP {i + 1} OF {CHAPTERS.length}
              </div>
              <div style={{ color: COLORS.white, fontSize: 44, fontWeight: 800 }}>
                {c.title}
              </div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Fast-forward badge, top-centre, while dead air is sped up
// ---------------------------------------------------------------------------
const FastForwardIcon: React.FC = () => (
  <svg width="34" height="24" viewBox="0 0 34 24">
    <path d="M2 2 L16 12 L2 22 Z" fill={COLORS.white} />
    <path d="M17 2 L31 12 L17 22 Z" fill={COLORS.white} />
  </svg>
);

export const SpeedBadges: React.FC = () => {
  const { badges: BADGES } = useVideo();
  const frame = useGlobalFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {BADGES.map(
        (s) => {
          const start = s.f0;
          const end = s.f1;
          if (frame < start || frame > end) {
            return null;
          }
          const visible = Math.min(
            interpolate(frame, [start, start + 8], [0, 1], clamp),
            interpolate(frame, [end - 8, end], [1, 0], clamp),
          );
          const pulse = 0.75 + 0.25 * Math.sin(frame / 4);
          return (
            <div
              key={s.f0}
              style={{
                position: "absolute",
                top: 48,
                left: "50%",
                translate: `-50% ${interpolate(visible, [0, 1], [-30, 0])}px`,
                opacity: visible,
                display: "flex",
                alignItems: "center",
                gap: 18,
                padding: "16px 32px",
                backgroundColor: COLORS.glass,
                border: `1.5px solid ${COLORS.glassBorder}`,
                borderRadius: 999,
                backdropFilter: "blur(16px)",
                color: COLORS.white,
                fontSize: 32,
                fontWeight: 700,
                boxShadow: "0 18px 50px rgba(0, 0, 0, 0.4)",
                whiteSpace: "nowrap",
              }}
            >
              <div style={{ opacity: pulse, display: "flex" }}>
                <FastForwardIcon />
              </div>
              <span style={{ color: COLORS.accent }}>{s.rate}×</span>
              <span>{s.label}</span>
            </div>
          );
        },
      )}
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Onboarding: creative preference checklist
// ---------------------------------------------------------------------------
const Check: React.FC<{ progress: number }> = ({ progress }) => (
  <div
    style={{
      width: 40,
      height: 40,
      borderRadius: 999,
      border: `3px solid ${progress > 0 ? COLORS.accent : "rgba(255,255,255,0.35)"}`,
      backgroundColor: progress > 0 ? COLORS.accent : "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}
  >
    <svg width="22" height="22" viewBox="0 0 22 22" style={{ opacity: progress }}>
      <path
        d="M4 11.5 L9 16 L18 6"
        fill="none"
        stroke={COLORS.white}
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="24"
        strokeDashoffset={24 * (1 - progress)}
      />
    </svg>
  </div>
);

export const PreferenceCard: React.FC = () => {
  const PICKS = useVideo().picks;
  const frame = useGlobalFrame();
  if (!PICKS) return null;
  const start = at(PICKS.t0);
  const end = at(PICKS.t1);
  if (frame < start || frame > end) {
    return null;
  }
  const appear = interpolate(frame, [start, start + 18], [0, 1], {
    ...clamp,
    easing: smooth,
  });
  const visible = Math.min(appear, interpolate(frame, [end - 12, end], [1, 0], clamp));

  return (
    <div
      style={{
        position: "absolute",
        left: 72,
        top: 250,
        width: 600,
        padding: "34px 36px",
        backgroundColor: COLORS.glass,
        border: `1.5px solid ${COLORS.glassBorder}`,
        borderRadius: 28,
        backdropFilter: "blur(18px)",
        boxShadow: "0 24px 70px rgba(0, 0, 0, 0.45)",
        opacity: visible,
        translate: `${interpolate(appear, [0, 1], [-60, 0])}px 0px`,
        color: COLORS.white,
      }}
    >
      <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: 3, color: COLORS.textSoft }}>
        YOUR CREATIVE STYLE
      </div>
      <div style={{ fontSize: 40, fontWeight: 800, marginTop: 6, marginBottom: 26 }}>
        One look per campaign type
      </div>
      {PICKS.rows.map((p) => {
        const tick = at(p.t);
        const progress = interpolate(frame, [tick, tick + 10], [0, 1], { ...clamp, easing: smooth });
        return (
          <div
            key={p.campaign}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 20,
              padding: "16px 0",
              borderTop: "1px solid rgba(255,255,255,0.10)",
            }}
          >
            <Check progress={progress} />
            <div style={{ fontSize: 32, fontWeight: 600, flex: 1, color: COLORS.textSoft }}>
              {p.campaign}
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 800,
                opacity: progress,
                translate: `${interpolate(progress, [0, 1], [20, 0])}px 0px`,
              }}
            >
              {p.choice}
            </div>
          </div>
        );
      })}
    </div>
  );
};
