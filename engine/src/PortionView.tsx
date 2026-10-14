import { Audio } from "@remotion/media";
import { AbsoluteFill, Sequence, staticFile } from "remotion";
import { Background } from "./components/Background";
import { Highlights } from "./components/Highlights";
import { Intro } from "./components/Intro";
import { Outro } from "./components/Outro";
import { ChapterChips, PreferenceCard, SpeedBadges } from "./components/Overlays";
import { Stage } from "./components/Stage";
import { GlobalOffset } from "./GlobalTime";
import type { VideoEdit } from "./lib/video";
import { COLORS, FONT } from "./theme";
import { VideoProvider } from "./VideoContext";

/** One portion of a tutorial. Layers use the global frame, so a portion looks
 *  identical previewed alone (Studio → <prefix>-Portions) or inside <prefix>-Full. */
export const PortionView: React.FC<{ video: VideoEdit; index: number }> = ({ video: v, index }) => {
  const p = v.portions[index];
  const introEnd = Math.round(v.stageIn * v.fps);
  const outroF = Math.round(v.outroStart * v.fps);
  return (
    <VideoProvider value={v}>
      <GlobalOffset value={p.f0}>
        <AbsoluteFill style={{ backgroundColor: COLORS.bgDeep, fontFamily: FONT }}>
          <Background />
          {p.f0 < introEnd + 10 ? <Intro /> : null}
          <Stage />
          <Highlights />
          <PreferenceCard />
          <SpeedBadges />
          <ChapterChips />
          {p.f0 + p.dur > outroF ? (
            <Sequence name="End card" from={outroF - p.f0} durationInFrames={v.totalFrames - outroF}>
              <GlobalOffset value={outroF}>
                <Outro />
              </GlobalOffset>
            </Sequence>
          ) : null}
          <Audio name="Voice + music + SFX (locked mix)" src={staticFile(v.audioSrc)} trimBefore={p.f0} />
        </AbsoluteFill>
      </GlobalOffset>
    </VideoProvider>
  );
};
