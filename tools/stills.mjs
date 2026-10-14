// Render selected frames as JPEG stills without a full render (G5 checks).
//   node tools/stills.mjs <engineDir> <outDir> 120,900,1800 [CompositionId]
import path from "node:path";
import { createRequire } from "node:module";
const projectDir = process.argv[2];
const outDir = process.argv[3];
const frames = process.argv[4].split(",").map(Number);
const require = createRequire(path.join(projectDir, "package.json"));
const { bundle } = require("@remotion/bundler");
const { renderStill, selectComposition, openBrowser } = require("@remotion/renderer");
const serveUrl = await bundle({ entryPoint: path.join(projectDir, "src/index.ts"), rootDir: projectDir, publicDir: path.join(projectDir, "public") });
const browser = await openBrowser("chrome");
const composition = await selectComposition({ serveUrl, id: process.argv[5] ?? "MA-Full", puppeteerInstance: browser });
for (const f of frames) {
  await renderStill({ composition, serveUrl, frame: f, output: path.join(outDir, `f${String(f).padStart(5, "0")}.jpeg`), imageFormat: "jpeg", jpegQuality: 80, scale: 0.5, puppeteerInstance: browser });
  process.stdout.write(f + " ");
}
await browser.close({ silent: true });
// bundles copy public/ (~200 MB) into the temp dir — remove it so stills never eat disk
(await import("node:fs")).rmSync(serveUrl, { recursive: true, force: true });
console.log("\ndone");
