#!/usr/bin/env node
// ElevenLabs voiceover generator (G4).
//
//   node tools/tts.mjs voices [search]                    voices already on your ElevenLabs account
//   node tools/tts.mjs library [search]                   Indian female voices in the shared library
//   node tools/tts.mjs add <publicOwnerId> <voiceId> <name>   add a library voice to your account
//   node tools/tts.mjs audition <slug> <voiceId,voiceId,...>  first 3 lines per voice -> audio/vo/audition/
//   node tools/tts.mjs render <slug> [L01 L02 ...]        all lines (or only the listed ones) -> audio/vo/
//   node tools/tts.mjs say "<text>" <out.mp3>             one-off pronunciation test
//
// Reads ELEVENLABS_API_KEY from .env at the repo root, voice/voice.json for defaults,
// and videos/<slug>/script.tts.json for the lines.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const API = "https://api.elevenlabs.io";

const loadEnv = () => {
  const file = path.join(ROOT, ".env");
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(file, "utf8")
      .split("\n")
      .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
      .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
  );
};

const KEY = process.env.ELEVENLABS_API_KEY || loadEnv().ELEVENLABS_API_KEY;
if (!KEY) {
  console.error("Missing ELEVENLABS_API_KEY. Copy .env.example to .env and paste your key there.");
  process.exit(1);
}
const VOICE = JSON.parse(fs.readFileSync(path.join(ROOT, "voice/voice.json"), "utf8"));

const api = async (method, url, body) => {
  const res = await fetch(API + url, {
    method,
    headers: { "xi-api-key": KEY, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${url} -> ${res.status} ${await res.text()}`);
  return res;
};

// Script markup -> TTS text. Pauses inside a line become <break>; the pause at the
// end of a line is applied by the mixer (pauseAfter), so it is dropped here.
const toSpeech = (text) =>
  text
    .replace(/\{[^}]*\}/g, "")
    .replace(/\s*\[ppp\]\s*$|\s*\[pp\]\s*$|\s*\[p\]\s*$/g, "")
    .replace(/\[ppp\]/g, '<break time="1.2s" />')
    .replace(/\[pp\]/g, '<break time="0.65s" />')
    .replace(/\[p\]/g, '<break time="0.35s" />')
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .trim();

const loadLines = (slug) => {
  const file = path.join(ROOT, "videos", slug, "script.tts.json");
  return JSON.parse(fs.readFileSync(file, "utf8")).lines;
};

// `tts` = production text (Hindi in Devanagari); falls back to the Roman review text.
const say = (line) => toSpeech(line.tts ?? line.text);

// Uses the with-timestamps endpoint so every line also gets word timings
// (<id>.align.json) — the mixer uses them to put clicks exactly on their word.
const speak = async (voiceId, lines, i, outFile) => {
  const res = await api(
    "POST",
    `/v1/text-to-speech/${voiceId}/with-timestamps?output_format=${VOICE.outputFormat}`,
    {
      text: say(lines[i]),
      model_id: VOICE.modelId,
      voice_settings: VOICE.voiceSettings,
      previous_text: i > 0 ? say(lines[i - 1]) : undefined,
      next_text: i < lines.length - 1 ? say(lines[i + 1]) : undefined,
    },
  );
  const data = await res.json();
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, Buffer.from(data.audio_base64, "base64"));
  fs.writeFileSync(outFile.replace(/\.mp3$/, ".align.json"), JSON.stringify(data.alignment));
  console.log("wrote", path.relative(ROOT, outFile));
};

// ---------------------------------------------------------------------------
// Passage mode: the script is generated as ONE take ("take": "one" in script.tts.json —
// section changes become a 1 s pause inside it) or one take per "## section"
// ("take": "sections"), then split into per-line WAVs at the middle of each pause.
// Played back to back the lines reproduce the take exactly; per-line alignment
// keeps click SFX anchored to their words.
// ---------------------------------------------------------------------------
const passageSpeech = (line) =>
  (line.tts ?? line.text)
    .replace(/\{[^}]*\}/g, "")
    .replace(/\s*\[p+\]\s*$/g, "")
    .replace(/\s*\[p\]\s*/g, " ") // short pauses come from commas — fewer break tags = smoother read
    .replace(/\[pp\]/g, '<break time="0.5s" />')
    .replace(/\[ppp\]/g, '<break time="1.0s" />')
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
const gapTag = (pause) => (pause >= 1 ? ' <break time="1.0s" /> ' : pause >= 0.6 ? ' <break time="0.6s" /> ' : " ");

const renderPassages = async (slug, only) => {
  const lines = loadLines(slug);
  const oneTake = JSON.parse(fs.readFileSync(path.join(ROOT, "videos", slug, "script.tts.json"), "utf8")).take === "one";
  const groups = [];
  for (const l of lines) {
    const g = groups.at(-1);
    if (oneTake && g) g.lines.push(l);
    else if (g && g.id === l.passage) g.lines.push(l);
    else groups.push({ id: oneTake ? "take" : l.passage, lines: [l] });
  }
  // one take: only section changes get a break tag (few tags = steady read); sentences pause on punctuation
  const gap = (l, n) => (oneTake ? (n.passage !== l.passage ? ' <break time="1.0s" /> ' : " ") : gapTag(l.pauseAfter));
  const textOf = (g) => g.lines.map((l, k) => passageSpeech(l) + (k < g.lines.length - 1 ? gap(l, g.lines[k + 1]) : "")).join("");
  const voDir = path.join(ROOT, "videos", slug, "audio/vo");
  const pDir = path.join(voDir, "passages");
  fs.mkdirSync(pDir, { recursive: true });
  for (let gi = 0; gi < groups.length; gi++) {
    const g = groups[gi];
    if (only.length && !only.includes(g.id)) continue;
    const text = textOf(g);
    const res = await api("POST", `/v1/text-to-speech/${VOICE.voiceId}/with-timestamps?output_format=${VOICE.outputFormat}`, {
      text,
      model_id: VOICE.modelId,
      voice_settings: VOICE.voiceSettings,
      previous_text: gi > 0 ? textOf(groups[gi - 1]) : undefined,
      next_text: gi < groups.length - 1 ? textOf(groups[gi + 1]) : undefined,
    });
    const data = await res.json();
    const mp3 = path.join(pDir, `${g.id}.mp3`);
    const wav = path.join(pDir, `${g.id}.wav`);
    fs.writeFileSync(mp3, Buffer.from(data.audio_base64, "base64"));
    fs.writeFileSync(path.join(pDir, `${g.id}.align.json`), JSON.stringify(data.alignment));
    execFileSync("ffmpeg", ["-v", "error", "-y", "-i", mp3, "-ar", "48000", "-ac", "2", wav]);
    const dur = Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", wav]).toString());

    // locate each line inside the take
    const al = data.alignment;
    const joined = al.characters.join("");
    let cursor = 0;
    const spans = g.lines.map((l) => {
      const t = passageSpeech(l);
      let i = joined.indexOf(t, cursor);
      let j = i >= 0 ? i + t.length : -1;
      if (i < 0) {
        i = joined.indexOf(t.slice(0, 12), cursor);
        const tail = t.slice(-12);
        j = joined.indexOf(tail, Math.max(i, cursor)) + tail.length;
      }
      if (i < 0 || j <= i) throw new Error(`${g.id}: could not find ${l.id} in the alignment`);
      cursor = j;
      return { i, j, start: al.character_start_times_seconds[i], end: al.character_end_times_seconds[j - 1] };
    });
    // cut at the middle of each pause; first line starts at 0, last ends at the end of the take
    const cuts = [0, ...spans.slice(1).map((sp, k) => (spans[k].end + sp.start) / 2), dur];
    g.lines.forEach((l, k) => {
      const a = cuts[k];
      const b = cuts[k + 1];
      execFileSync("ffmpeg", ["-v", "error", "-y", "-i", wav, "-af", `atrim=start=${a}:end=${b},asetpts=PTS-STARTPTS`, path.join(voDir, `${l.id}.wav`)]);
      const sp = spans[k];
      fs.writeFileSync(
        path.join(voDir, `${l.id}.align.json`),
        JSON.stringify({
          characters: al.characters.slice(sp.i, sp.j),
          character_start_times_seconds: al.character_start_times_seconds.slice(sp.i, sp.j).map((x) => x - a),
          character_end_times_seconds: al.character_end_times_seconds.slice(sp.i, sp.j).map((x) => x - a),
        }),
      );
    });
    console.log(`${g.id}: ${g.lines.map((l) => l.id).join(" ")} · ${dur.toFixed(1)}s`);
  }
};

const [cmd, ...args] = process.argv.slice(2);

if (cmd === "voices") {
  const q = args[0] ? `&search=${encodeURIComponent(args[0])}` : "";
  const data = await (await api("GET", `/v2/voices?page_size=100${q}`)).json();
  for (const v of data.voices) {
    const l = v.labels ?? {};
    console.log(`${v.voice_id}  ${v.name}  [${l.gender ?? ""} ${l.accent ?? ""} ${l.age ?? ""} ${l.use_case ?? ""}]`);
  }
} else if (cmd === "library") {
  const q = args[0] ? `&search=${encodeURIComponent(args[0])}` : "";
  const data = await (
    await api("GET", `/v1/shared-voices?page_size=30&gender=female&language=hi${q}`)
  ).json();
  for (const v of data.voices) {
    console.log(
      `${v.public_owner_id} ${v.voice_id}  ${v.name}  [${v.accent ?? ""} ${v.age ?? ""} ${v.use_case ?? ""} ${v.descriptive ?? ""}]  ${v.preview_url ?? ""}`,
    );
  }
} else if (cmd === "add") {
  const [owner, voiceId, name] = args;
  const data = await (await api("POST", `/v1/voices/add/${owner}/${voiceId}`, { new_name: name })).json();
  console.log("added voice", data.voice_id);
} else if (cmd === "audition") {
  const [slug, ids] = args;
  const lines = loadLines(slug);
  for (const id of ids.split(",")) {
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      await speak(id, lines, i, path.join(ROOT, "videos", slug, "audio/vo/audition", id, `${lines[i].id}.mp3`));
    }
  }
} else if (cmd === "say") {
  // quick pronunciation test: node tools/tts.mjs say "<text>" <out.mp3>
  const [text, out] = args;
  const lines = [{ id: "say", text }];
  await speak(VOICE.voiceId, lines, 0, path.resolve(out));
} else if (cmd === "render" && loadLines(args[0]).some((l) => l.passage)) {
  await renderPassages(args[0], args.slice(1));
} else if (cmd === "render") {
  const [slug, ...only] = args;
  if (!VOICE.voiceId) throw new Error("Set voiceId in voice/voice.json first (pick one with audition).");
  const lines = loadLines(slug);
  for (let i = 0; i < lines.length; i++) {
    if (only.length && !only.includes(lines[i].id)) continue;
    await speak(VOICE.voiceId, lines, i, path.join(ROOT, "videos", slug, "audio/vo", `${lines[i].id}.mp3`));
  }
} else {
  console.log(fs.readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(1, 11).join("\n"));
}
