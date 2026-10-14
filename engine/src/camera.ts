import { Easing } from "remotion";
import type { Rect, VideoEdit } from "./lib/video";
import { VIDEO_H, VIDEO_W } from "./theme";

// The screen "window" fits 920 px tall at zoom 1, centred on the canvas.
const STAGE_H = 920;
const ease = Easing.bezier(0.45, 0, 0.2, 1);

type CamState = { z: number; x: number; y: number };
type Key = { state: CamState; start: number; duration: number };
type Move = { from: CamState; to: CamState; start: number; duration: number };

const keyCache = new WeakMap<VideoEdit, Key[]>();
const keysOf = (v: VideoEdit): Key[] => {
  let k = keyCache.get(v);
  if (!k) {
    k = v.camera.map((c) => ({
      state: { z: c.z, x: c.x, y: c.y },
      start: Math.round(c.t * v.fps),
      duration: Math.max(1, Math.round((c.d ?? 1) * v.fps)),
    }));
    keyCache.set(v, k);
  }
  return k;
};

const sample = (m: Move, frame: number): CamState => {
  const e = ease(Math.min(1, Math.max(0, (frame - m.start) / m.duration)));
  return {
    z: Math.exp(Math.log(m.from.z) + (Math.log(m.to.z) - Math.log(m.from.z)) * e),
    x: m.from.x + (m.to.x - m.from.x) * e,
    y: m.from.y + (m.to.y - m.from.y) * e,
  };
};

const stateAt = (v: VideoEdit, frame: number): CamState => {
  const keys = keysOf(v);
  let move: Move | null = null;
  for (const k of keys) {
    if (k.start > frame) break;
    const from: CamState = move ? sample(move, k.start) : keys[0].state;
    move = { from, to: k.state, start: k.start, duration: k.duration };
  }
  return move ? sample(move, frame) : keys[0].state;
};

const clampAxis = (ideal: number, size: number, viewport: number) =>
  size <= viewport ? (viewport - size) / 2 : Math.min(0, Math.max(viewport - size, ideal));

export type CameraTransform = { left: number; top: number; scale: number };

export const cameraAt = (v: VideoEdit, frame: number): CameraTransform => {
  const { z, x, y } = stateAt(v, frame);
  const scale = (STAGE_H / v.srcH) * z;
  return {
    left: clampAxis(VIDEO_W / 2 - x * scale, v.srcW * scale, VIDEO_W),
    top: clampAxis(VIDEO_H / 2 - y * scale, v.srcH * scale, VIDEO_H),
    scale,
  };
};

export const toScreen = (cam: CameraTransform, r: Rect) => ({
  x: cam.left + r[0] * cam.scale,
  y: cam.top + r[1] * cam.scale,
  w: (r[2] - r[0]) * cam.scale,
  h: (r[3] - r[1]) * cam.scale,
});
