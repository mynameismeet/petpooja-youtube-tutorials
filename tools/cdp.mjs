#!/usr/bin/env node
// Chrome DevTools Protocol client for the user's own Chrome
// (chrome://inspect/#remote-debugging → "Allow remote debugging for this browser instance").
// Every browser action goes through this one command, so one "always allow" covers a session.
// Scope: Attendo tabs (payroll.petpooja.com) only — never reads cookies, storage or other sites.
// Clicks on data-changing buttons (Mark as Paid, Finalize, Save, Delete…) are refused unless the
// selector starts with "!" — use that only after the user approved that exact click.
//
//   node tools/cdp.mjs tabs                                   list Attendo tabs
//   node tools/cdp.mjs look   <tab> <out.jpg> [url]           (navigate,) settle, screenshot + visible text
//   node tools/cdp.mjs shot   <tab> <out.jpg|png> [scale]     screenshot the viewport (default scale 0.5)
//   node tools/cdp.mjs text   <tab> [maxChars]                visible text
//   node tools/cdp.mjs eval   <tab> "<js>"                    run an expression, print the result
//   node tools/cdp.mjs goto   <tab> <url>                     navigate (Attendo only)
//   node tools/cdp.mjs find   <tab> "<target>"                where an element is (no click)
//   node tools/cdp.mjs click  <tab> "<target>" [out.jpg]      real mouse click (+ screenshot after)
//   node tools/cdp.mjs type   <tab> "<text>"                  type into the focused field
//   node tools/cdp.mjs key    <tab> Enter|Escape|Tab          press a key
//   node tools/cdp.mjs scroll <tab> <dy> ["<target>"] [out.jpg]  mouse-wheel scroll (over an element)
//   node tools/cdp.mjs record <tab> <outdir> <steps.json>     screencast while running steps →
//                                                             outdir/frames/*.jpg + outdir/events.json
// <target>: a CSS selector, or text:Label (exact visible text); add @2 (or #2 after text:) for the 2nd match.
// steps: [["wait",1.5], ["settle"], ["click","text:Payroll"], ["scroll",400,"table"], ["hscroll",600,"table"],
//         ["type","Ankit"], ["key","Enter"], ["goto",url], ["hover","text:…"], ["mark","L05"],
//         ["shot","out.jpg"], ["text",3000], ["eval","js"]]
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const PORT_FILE = path.join(os.homedir(), "Library/Application Support/Google/Chrome/DevToolsActivePort");
const [port, wsPath] = fs.readFileSync(PORT_FILE, "utf8").trim().split("\n");
const ALLOWED = /^https:\/\/payroll\.petpooja\.com\//; // Attendo dashboard only
const GUARDED = /\b(log ?out|sign ?out|delete|remove|mark as paid|finali[sz]e|confirm|submit|save|approve|reject|send|pay|proceed|generate|lock|run payroll)\b|^process$/i;
const sleep = (s) => new Promise((r) => setTimeout(r, s * 1000));

export const connect = () =>
  new Promise((resolve, reject) => {
    const ws = new WebSocket(`ws://127.0.0.1:${port}${wsPath}`);
    let id = 0;
    const pending = new Map();
    const listeners = new Set();
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.id && pending.has(m.id)) {
        const { res, rej } = pending.get(m.id);
        pending.delete(m.id);
        m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result);
      } else for (const l of listeners) l(m);
    };
    ws.onerror = () => reject(new Error("could not connect — is remote debugging allowed in Chrome?"));
    ws.onopen = () =>
      resolve({
        send: (method, params = {}, sessionId) =>
          new Promise((res, rej) => {
            const mid = ++id;
            pending.set(mid, { res, rej });
            ws.send(JSON.stringify({ id: mid, method, params, ...(sessionId ? { sessionId } : {}) }));
          }),
        on: (fn) => listeners.add(fn),
        close: () => ws.close(),
      });
  });

export const attach = async (cdp, targetId) => {
  const { targetInfos } = await cdp.send("Target.getTargets");
  const t = targetInfos.find((x) => x.targetId.startsWith(targetId));
  if (!t || !ALLOWED.test(t.url)) throw new Error("not an Attendo tab");
  const { sessionId } = await cdp.send("Target.attachToTarget", { targetId: t.targetId, flatten: true });
  return { sessionId, t };
};

// A browser session on one Attendo tab: page helpers shared by the CLI and record().
const session = async (cdp, tab) => {
  const { sessionId: s } = await attach(cdp, tab);
  const dialogs = { accept: false };
  cdp.on((m) => {
    if (m.sessionId !== s) return;
    if (m.method === "Page.javascriptDialogOpening") {
      console.log(`dialog: "${m.params.message}" → ${dialogs.accept ? "accepted" : "dismissed"}`);
      cdp.send("Page.handleJavaScriptDialog", { accept: dialogs.accept }, s);
      dialogs.accept = false;
    }
    if (m.method === "Page.frameNavigated" && !m.params.frame.parentId && !ALLOWED.test(m.params.frame.url)) {
      console.log("left Attendo → stopping");
      process.exit(2);
    }
  });
  await cdp.send("Page.enable", {}, s);
  const evaluate = async (expression) => {
    const r = await cdp.send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }, s);
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  const mouse = (type, x, y, extra = {}) => cdp.send("Input.dispatchMouseEvent", { type, x, y, ...extra }, s);
  let pos = { x: 720, y: 400 };
  const glide = async (x, y, secs = 0.35) => {
    const n = Math.max(1, Math.round(secs * 40));
    for (let i = 1; i <= n; i++) {
      const k = 0.5 - Math.cos((Math.PI * i) / n) / 2;
      await mouse("mouseMoved", pos.x + (x - pos.x) * k, pos.y + (y - pos.y) * k);
      await sleep(secs / n);
    }
    pos = { x, y };
  };
  const settle = async (extra = 1.2) => {
    for (let i = 0; i < 40 && (await evaluate("document.readyState")) !== "complete"; i++) await sleep(0.25);
    await sleep(extra);
  };
  const api = {
    s,
    dialogs,
    evaluate,
    settle,
    pos: () => pos,
    async find(target) {
      const sel = target.replace(/^!/, "");
      const p = await evaluate(`(${FIND})(${JSON.stringify(sel)})`);
      if (!p?.found) throw new Error(`not found: ${sel} (${p?.count ?? 0} candidates)`);
      return p;
    },
    async hover(target) {
      const p = await api.find(target);
      await glide(p.x, p.y);
      return p;
    },
    async click(target) {
      const p = await api.find(target);
      if (GUARDED.test(p.label) && !target.startsWith("!"))
        throw new Error(`"${p.label}" changes data — refused (prefix the target with ! only after the user approved this click)`);
      if (target.startsWith("!")) dialogs.accept = true;
      await glide(p.x, p.y);
      await mouse("mousePressed", p.x, p.y, { button: "left", clickCount: 1 });
      await sleep(0.06);
      await mouse("mouseReleased", p.x, p.y, { button: "left", clickCount: 1 });
      return p;
    },
    async scroll(dy, target, dx = 0) {
      if (target) {
        const p = await api.find(target);
        await glide(p.x, p.y, 0.25);
      }
      const n = Math.max(1, Math.round(Math.max(Math.abs(dy), Math.abs(dx)) / 40));
      for (let i = 0; i < n; i++) {
        await mouse("mouseWheel", pos.x, pos.y, { deltaX: dx / n, deltaY: dy / n });
        await sleep(0.016);
      }
    },
    async type(text) {
      for (const ch of text) {
        await cdp.send("Input.insertText", { text: ch }, s);
        await sleep(0.07);
      }
    },
    async key(name) {
      const code = { Enter: 13, Escape: 27, Tab: 9, ArrowDown: 40, ArrowUp: 38, Backspace: 8 }[name];
      if (!code) throw new Error(`unknown key ${name}`);
      const k = { key: name, code: name, windowsVirtualKeyCode: code, ...(name === "Enter" ? { text: "\r" } : {}) };
      await cdp.send("Input.dispatchKeyEvent", { type: "keyDown", ...k }, s);
      await cdp.send("Input.dispatchKeyEvent", { type: "keyUp", ...k }, s);
    },
    async goto(url) {
      if (!ALLOWED.test(url)) throw new Error("only Attendo URLs");
      await cdp.send("Page.navigate", { url }, s);
      await settle(2);
    },
    async shot(out, scale = 0.5) {
      const v = await evaluate("({w: innerWidth, h: innerHeight, x: visualViewport.pageLeft, y: visualViewport.pageTop})");
      const format = out.endsWith(".png") ? "png" : "jpeg";
      const { data } = await cdp.send(
        "Page.captureScreenshot",
        { format, ...(format === "jpeg" ? { quality: 82 } : {}), clip: { x: v.x, y: v.y, width: v.w, height: v.h, scale: +scale } },
        s,
      );
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, Buffer.from(data, "base64"));
    },
    text: (max = 6000) => evaluate(`document.body.innerText.replace(/\\n{3,}/g, "\\n\\n").slice(0, ${+max})`),
  };
  return api;
};

// Runs in the page: locate a target, scroll it into view if needed, return its centre (CSS px).
const FIND = `(sel) => {
  let n = 1;
  const m = sel.match(/@(\\d+)$/) || (sel.startsWith("text:") && sel.match(/#(\\d+)$/));
  if (m) { n = +m[1]; sel = sel.slice(0, -m[0].length); }
  const norm = (s) => (s || "").trim().toLowerCase().replace(/\\s+/g, " ");
  const vis = (e) => { const r = e.getBoundingClientRect(), c = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && c.visibility !== "hidden" && c.display !== "none"; };
  let els;
  if (sel.startsWith("text:")) {
    const want = norm(sel.slice(5));
    els = [...document.querySelectorAll("body *")].filter((e) => norm(e.innerText ?? e.textContent) === want && vis(e));
    els = els.filter((e) => !els.some((o) => o !== e && e.contains(o)));
  } else els = [...document.querySelectorAll(sel)].filter(vis);
  const el = els[n - 1];
  if (!el) return { found: 0, count: els.length };
  let r = el.getBoundingClientRect();
  if (r.top < 60 || r.bottom > innerHeight - 10 || r.left < 0 || r.right > innerWidth) {
    el.scrollIntoView({ block: "center", inline: "nearest" });
    r = el.getBoundingClientRect();
  }
  const btn = el.closest("button, a, [role=button], [role=menuitem], [role=tab], input, label, li");
  return { found: els.length, x: r.x + r.width / 2, y: r.y + r.height / 2, l: r.x, t: r.y, w: r.width, h: r.height,
    tag: (btn || el).tagName.toLowerCase(), label: norm((btn || el).innerText ?? el.value).slice(0, 60) };
}`;

// One step of a do/record script; log(type, extra) notes what happened.
const step = async (b, [op, a, c], log) => {
  if (op === "wait") await sleep(a);
  else if (op === "settle") await b.settle(a ?? 1.2);
  else if (op === "mark") log("mark", { id: a });
  else if (op === "goto") (log("goto", { url: a }), await b.goto(a));
  else if (op === "type") (log("type", { text: a }), await b.type(a));
  else if (op === "key") (log("key", { key: a }), await b.key(a));
  else if (op === "scroll" || op === "hscroll") {
    log("scroll-start", { [op === "scroll" ? "dy" : "dx"]: a, target: c ?? null });
    await (op === "scroll" ? b.scroll(a, c) : b.scroll(0, c, a));
    log("scroll-end", { cursor: b.pos() });
  } else if (op === "hover" || op === "click") {
    const p = await (op === "click" ? b.click(a) : b.hover(a));
    log(op, { target: a, x: p.x, y: p.y, box: [p.l, p.t, p.w, p.h], label: p.label });
  } else if (op === "shot") (await b.shot(a, c ?? 0.5), log("shot", { out: a }));
  else if (op === "text") console.log(`--- ${await b.evaluate("location.href")}\n${await b.text(a ?? 4000)}`);
  else if (op === "eval") {
    const v = await b.evaluate(a);
    console.log(typeof v === "string" ? v : JSON.stringify(v));
  } else throw new Error(`unknown step ${op}`);
};
const readSteps = (x) => JSON.parse(x.trim().startsWith("[") ? x : fs.readFileSync(x, "utf8"));

// Screencast the tab at its real window size (frames ≤ 2560 wide) while running steps; log every action.
// Emulating a 16:9 viewport does not change what the screencast captures — size the Chrome window instead.
const record = async (cdp, b, outdir, steps) => {
  fs.mkdirSync(path.join(outdir, "frames"), { recursive: true });
  const frames = [];
  const events = [];
  const now = () => Date.now() / 1000;
  const freeMB = () => {
    const st = fs.statfsSync(outdir);
    return (st.bavail * st.bsize) / 2 ** 20;
  };
  let lowDisk = false;
  cdp.on((m) => {
    if (m.sessionId !== b.s || m.method !== "Page.screencastFrame" || lowDisk) return;
    if (frames.length % 40 === 0 && freeMB() < 150) {
      lowDisk = true;
      console.log("disk below 150 MB — stopping the recording");
      return;
    }
    const f = `frames/${String(frames.length).padStart(6, "0")}.jpg`;
    fs.writeFileSync(path.join(outdir, f), Buffer.from(m.params.data, "base64"));
    frames.push({ f, t: m.params.metadata.timestamp });
    cdp.send("Page.screencastFrameAck", { sessionId: m.params.sessionId }, b.s);
  });
  await cdp.send("Page.bringToFront", {}, b.s);
  const viewport = await b.evaluate("({ width: innerWidth, height: innerHeight })");
  await sleep(1);
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 85, maxWidth: 2560, maxHeight: 1440 }, b.s);
  const t0 = now();
  const log = (type, extra = {}) => {
    events.push({ t: +(now() - t0).toFixed(3), type, ...extra });
    console.log(events.at(-1));
  };
  log("start", { cursor: b.pos() });
  try {
    for (const st of steps) {
      if (lowDisk) throw new Error("stopped: low disk");
      await step(b, st, log);
    }
    await sleep(1);
    log("end");
  } finally {
    await cdp.send("Page.stopScreencast", {}, b.s);
    const first = frames[0]?.t ?? t0;
    fs.writeFileSync(
      path.join(outdir, "events.json"),
      // scale: CSS px -> px of the 2560-wide video that frames-to-mp4.py makes
      JSON.stringify({ viewport, scale: 2560 / viewport.width, t0Offset: +(t0 - first).toFixed(3),
        frames: frames.map((x) => ({ f: x.f, t: +(x.t - first).toFixed(3) })), events }, null, 1),
    );
    console.log(`${frames.length} frames → ${outdir}`);
  }
};

const [cmd, tab, a2, a3, a4] = process.argv.slice(2);
if (cmd) {
  const cdp = await connect();
  try {
    if (cmd === "tabs") {
      const { targetInfos } = await cdp.send("Target.getTargets");
      const pages = targetInfos.filter((x) => x.type === "page");
      console.log(`${pages.length} tabs open; Attendo tabs:`);
      for (const p of pages.filter((x) => ALLOWED.test(x.url))) console.log(`${p.targetId.slice(0, 12)} | ${p.title.slice(0, 50)} | ${p.url.slice(0, 110)}`);
    } else {
      const b = await session(cdp, tab);
      if (cmd === "look") {
        if (a3) await b.goto(a3);
        else await b.settle(0.5);
        await b.shot(a2);
        console.log(`url: ${await b.evaluate("location.href")}\nsaved ${a2}\n---\n${await b.text()}`);
      } else if (cmd === "shot") (await b.shot(a2, a3 ?? 0.5), console.log("saved", a2));
      else if (cmd === "text") console.log(await b.text(a2 ?? 20000));
      else if (cmd === "eval") {
        const v = await b.evaluate(a2);
        console.log(typeof v === "string" ? v : JSON.stringify(v, null, 1));
      } else if (cmd === "goto") (await b.goto(a2), console.log("at", await b.evaluate("location.href")));
      else if (cmd === "find") console.log(JSON.stringify(await b.find(a2)));
      else if (cmd === "click" || cmd === "scroll") {
        if (cmd === "click") console.log("clicked", JSON.stringify(await b.click(a2)));
        else await b.scroll(+a2, a3 && !/\.(jpe?g|png)$/.test(a3) ? a3 : undefined);
        const out = cmd === "click" ? a3 : [a3, a4].find((x) => /\.(jpe?g|png)$/.test(x ?? ""));
        await b.settle(1.2);
        if (out) (await b.shot(out), console.log(`url: ${await b.evaluate("location.href")}\nsaved ${out}`));
      } else if (cmd === "type") (await b.type(a2), console.log("typed"));
      else if (cmd === "key") (await b.key(a2), console.log("pressed", a2));
      else if (cmd === "record") await record(cdp, b, a2, readSteps(a3));
      else if (cmd === "do") {
        for (const [i, st] of readSteps(a2).entries()) {
          try {
            await step(b, st, (type, extra) => console.log(`${i}: ${type} ${JSON.stringify(extra)}`));
          } catch (e) {
            console.log(`${i}: ${JSON.stringify(st)} failed — ${e.message}`);
            process.exitCode = 1;
            break;
          }
        }
      }
      else throw new Error(`unknown command ${cmd}`);
    }
  } finally {
    cdp.close();
  }
}
