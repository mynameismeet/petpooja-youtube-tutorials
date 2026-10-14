import { createContext, useContext } from "react";
import type { VideoEdit } from "./lib/video";

// Which tutorial is being rendered. PortionView provides it; every layer reads it.
const Ctx = createContext<VideoEdit | null>(null);
export const VideoProvider = Ctx.Provider;
export const useVideo = (): VideoEdit => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useVideo() outside <VideoProvider>");
  return v;
};
