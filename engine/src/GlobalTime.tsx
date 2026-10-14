import { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";

// A portion renders a slice of the full timeline. Layers read the GLOBAL frame
// (portion start + local frame) so camera, background and overlays stay continuous
// whether a portion is previewed alone or inside the full video.
const Offset = createContext(0);
export const GlobalOffset = Offset.Provider;
export const useGlobalFrame = () => useCurrentFrame() + useContext(Offset);
export const useOffset = () => useContext(Offset);
