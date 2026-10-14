import { Composition, Folder, Sequence } from "remotion";
import type { VideoEdit } from "./lib/video";
import { PortionView } from "./PortionView";
import { VIDEO_H, VIDEO_W } from "./theme";

const kebab = (s: string) => s.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Studio ids: <prefix>-Full and <prefix>-<nn>-<Portion-name>. */
export const portionId = (v: VideoEdit, i: number) => `${v.prefix}-${v.portions[i].id}-${kebab(v.portions[i].name)}`;

// One stable component per portion = one "connected composition": double-click a
// portion bar in <prefix>-Full to open it on its own canvas at that frame.
const build = (v: VideoEdit) => {
  const parts = v.portions.map((p, i) => {
    const C: React.FC = () => <PortionView video={v} index={i} />;
    C.displayName = portionId(v, i);
    return C;
  });
  const Full: React.FC = () => (
    <>
      {v.portions.map((p, i) => {
        const Part = parts[i];
        return (
          <Sequence key={p.id} name={`${p.id} · ${p.name}`} from={p.f0} durationInFrames={p.dur}>
            <Part />
          </Sequence>
        );
      })}
    </>
  );
  return { parts, Full };
};

const cache = new Map<string, ReturnType<typeof build>>();
const built = (v: VideoEdit) => {
  if (!cache.has(v.slug)) cache.set(v.slug, build(v));
  return cache.get(v.slug)!;
};

export const VideoCompositions: React.FC<{ video: VideoEdit }> = ({ video: v }) => {
  const { parts, Full } = built(v);
  const size = { fps: v.fps, width: VIDEO_W, height: VIDEO_H };
  return (
    <Folder name={v.slug}>
      <Composition id={`${v.prefix}-Full`} component={Full} durationInFrames={v.totalFrames} {...size} />
      <Folder name={`${v.prefix}-Portions`}>
        {parts.map((Part, i) => (
          <Composition key={i} id={portionId(v, i)} component={Part} durationInFrames={v.portions[i].dur} {...size} />
        ))}
      </Folder>
    </Folder>
  );
};
