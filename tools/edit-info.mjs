#!/usr/bin/env node
// Print a video's edit facts as JSON (hold stills, portions, Studio ids).
//   node tools/edit-info.mjs <slug>
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const slug = process.argv[2];
const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "edit-info-")), "edit.mjs");
execFileSync(path.join(ROOT, "engine/node_modules/.bin/esbuild"), [
  path.join(ROOT, "engine/src/videos", slug, "edit.ts"), "--bundle", "--format=esm", "--platform=node", `--outfile=${out}`, "--log-level=error",
]);
const { VIDEO: v } = await import(out);
fs.rmSync(path.dirname(out), { recursive: true, force: true });
const kebab = (s) => s.replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "");
console.log(JSON.stringify({
  slug: v.slug, prefix: v.prefix, fps: v.fps, totalFrames: v.totalFrames, full: `${v.prefix}-Full`,
  holdTimes: v.holdTimes,
  portions: v.portions.map((p) => ({ ...p, composition: `${v.prefix}-${p.id}-${kebab(p.name)}` })),
  badges: v.badges, slowest: Math.min(...v.clips.filter((c) => !c.still).map((c) => c.rate)),
}));
