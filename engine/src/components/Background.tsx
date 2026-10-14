import { AbsoluteFill } from "remotion";
import { useGlobalFrame } from "../GlobalTime";
import { COLORS } from "../theme";

const Blob: React.FC<{
  color: string;
  size: number;
  x: number;
  y: number;
  driftX: number;
  driftY: number;
  speed: number;
}> = ({ color, size, x, y, driftX, driftY, speed }) => {
  const frame = useGlobalFrame();
  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        left: x - size / 2,
        top: y - size / 2,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, transparent 68%)`,
        translate: `${Math.sin(frame / speed) * driftX}px ${Math.cos(frame / (speed * 1.3)) * driftY}px`,
      }}
    />
  );
};

export const Background: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, ${COLORS.bgDeep} 0%, ${COLORS.bgMid} 55%, #142F78 100%)`,
        overflow: "hidden",
      }}
    >
      <Blob color="rgba(59, 123, 255, 0.55)" size={1300} x={1650} y={180} driftX={80} driftY={60} speed={90} />
      <Blob color="rgba(255, 77, 79, 0.28)" size={1100} x={180} y={980} driftX={70} driftY={50} speed={110} />
      <Blob color="rgba(140, 92, 255, 0.30)" size={900} x={420} y={120} driftX={60} driftY={70} speed={130} />
      <AbsoluteFill
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.07) 1.2px, transparent 1.2px)",
          backgroundSize: "34px 34px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />
    </AbsoluteFill>
  );
};
