import { Video } from "@remotion/media";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { cameraAt } from "../camera";
import { useGlobalFrame, useOffset } from "../GlobalTime";
import { useVideo } from "../VideoContext";
import { StageExtras } from "./StageExtras";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const Stage: React.FC = () => {
  const v = useVideo();
  const IN = Math.round(v.stageIn * v.fps);
  const frame = useGlobalFrame();
  const offset = useOffset();
  const { durationInFrames } = useVideoConfig();
  if (frame < IN) return null;

  const cam = cameraAt(v, frame);
  const enter = interpolate(frame, [IN, IN + 22], [0, 1], { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) });
  // only mount clips that touch this portion (plus a little premount margin)
  const visible = v.clips.filter((c) => c.f1 > offset - 30 && c.f0 < offset + durationInFrames + 30);

  return (
    <AbsoluteFill
      style={{
        opacity: enter,
        scale: String(interpolate(enter, [0, 1], [0.9, 1])),
        translate: `0px ${interpolate(enter, [0, 1], [90, 0])}px`,
      }}
    >
      <div
        style={{
          position: "absolute",
          width: v.srcW,
          height: v.srcH,
          transformOrigin: "0 0",
          translate: `${cam.left}px ${cam.top}px`,
          scale: String(cam.scale),
          borderRadius: 28,
          overflow: "hidden",
          backgroundColor: "#ffffff",
          boxShadow: "0 50px 160px rgba(0, 0, 0, 0.55), 0 0 0 2px rgba(255, 255, 255, 0.10)",
        }}
      >
        {visible.map((c) => (
          <Sequence key={c.f0} name={c.label} from={c.f0 - offset} durationInFrames={c.f1 - c.f0} premountFor={30}>
            {c.still ? (
              <Img src={staticFile(c.still)} style={{ width: "100%", height: "100%" }} />
            ) : (
              <Video
                src={staticFile(v.screenSrc)}
                trimBefore={c.srcFrame}
                playbackRate={c.rate}
                muted
                objectFit="fill"
                style={{ width: "100%", height: "100%" }}
              />
            )}
          </Sequence>
        ))}
        <StageExtras />
      </div>
    </AbsoluteFill>
  );
};
