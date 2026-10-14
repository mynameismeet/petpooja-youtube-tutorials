import { VideoCompositions } from "./compositions";
import { VIDEOS } from "./videos";

export const RemotionRoot: React.FC = () => (
  <>
    {VIDEOS.map((v) => (
      <VideoCompositions key={v.slug} video={v} />
    ))}
  </>
);
