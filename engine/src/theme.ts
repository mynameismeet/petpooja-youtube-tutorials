import { loadFont } from "@remotion/google-fonts/PlusJakartaSans";
import type { Theme } from "./lib/video";

const { fontFamily } = loadFont("normal", {
  weights: ["500", "600", "700", "800"],
  subsets: ["latin"],
});

export const FONT = fontFamily;

export const COLORS = {
  bgDeep: "#060F24",
  bgMid: "#0C2457",
  bgBright: "#1B4FD8",
  accent: "#FF4D4F",
  accentGlow: "rgba(255, 77, 79, 0.45)",
  blue: "#3B7BFF",
  white: "#FFFFFF",
  textSoft: "rgba(255, 255, 255, 0.72)",
  glass: "rgba(10, 18, 40, 0.78)",
  glassBorder: "rgba(255, 255, 255, 0.14)",
};

/** A video's accent colours (VideoInput.theme), falling back to Petpooja red. */
export const accentOf = (t?: Theme) => ({
  accent: t?.accent ?? COLORS.accent,
  glow: t?.accentGlow ?? COLORS.accentGlow,
  gradient: t?.gradient ?? ([COLORS.accent, "#FF9F43"] as [string, string]),
});

export const VIDEO_W = 1920;
export const VIDEO_H = 1080;
