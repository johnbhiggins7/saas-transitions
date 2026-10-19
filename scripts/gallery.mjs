#!/usr/bin/env node
// Build review/index.html: every transition's preview.mp4 grouped by category, with its git review status.
// Serve the skill root over http (e.g. `python3 -m http.server 8765`) and open /review/.
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync, renameSync, mkdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CATEGORIES = [
  ["camera-spatial", "Camera & Spatial"],
  ["morphing", "Morphing & Shape-Shifting"],
  ["ui-native", "UI-Native & Contextual"],
  ["masking", "Masking, Wipes & Mattes"],
  ["match-cuts", "Match Cuts, Momentum & Leading"],
  ["soft", "Soft & Atmospheric"],
];

function frontmatter(file) {
  const m = readFileSync(file, "utf8").match(/^---\n([\s\S]*?)\n---/);
  const out = {};
  for (const line of m ? m[1].split("\n") : []) {
    const kv = line.match(/^([a-z_]+):\s*(.*)$/);
    if (kv) out[kv[1]] = kv[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

function status(slug) {
  const git = (...a) => execFileSync("git", a, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  try {
    git("cat-file", "-e", `HEAD:transitions/${slug}/SKILL.md`);
  } catch {
    return "draft";
  }
  return git("status", "--porcelain", "--", `transitions/${slug}`) ? "changed" : "approved";
}

const esc = (s = "") => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const dir = join(ROOT, "transitions");
const items = readdirSync(dir)
  .filter((s) => existsSync(join(dir, s, "SKILL.md")))
  .map((slug) => {
    const fm = frontmatter(join(dir, slug, "SKILL.md"));
    const video = join(dir, slug, "preview.mp4");
    return { slug, ...fm, status: status(slug), v: existsSync(video) ? Math.round(statSync(video).mtimeMs) : 0 };
  });

const counts = { approved: 0, changed: 0, draft: 0 };
items.forEach((i) => counts[i.status]++);

const sections = CATEGORIES.map(([key, label]) => {
  const group = items.filter((i) => i.category === key);
  if (!group.length) return "";
  const tiles = group
    .map(
      (i) => `
    <article class="tile" data-status="${i.status}">
      ${i.v ? `<video src="../transitions/${i.slug}/preview.mp4?v=${i.v}" autoplay muted loop playsinline></video>` : `<div class="missing">not rendered yet</div>`}
      <div class="meta">
        <div class="row"><h3>${esc(i.title || i.slug)}</h3><span class="badge ${i.status}">${i.status}</span></div>
        <code>${i.slug}</code>${i.duration ? ` · ${esc(i.duration)}` : ""}
        <p>${esc(i.description)}</p>
        <div class="row actions">
          <button data-rate="1">1×</button><button data-rate="0.5">½×</button><button data-rate="0.25">¼×</button>
          <button data-restart>⟲</button>
          ${i.v ? `<a href="../transitions/${i.slug}/contact.png?v=${i.v}" target="_blank">frames</a>` : ""}
        </div>
      </div>
    </article>`,
    )
    .join("");
  return `<section><h2>${label} <span>${group.length}</span></h2><div class="grid">${tiles}</div></section>`;
}).join("");

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Transition Review</title>
<style>
  :root { --bg:#f6f8fb; --card:#fff; --ink:#0a2540; --muted:#64748b; --line:#e3e8ef; --accent:#635bff; }
  * { box-sizing:border-box; } body { margin:0; background:var(--bg); color:var(--ink); font:15px/1.5 Inter, system-ui, sans-serif; }
  header { position:sticky; top:0; z-index:5; background:rgba(246,248,251,.92); backdrop-filter:blur(8px); border-bottom:1px solid var(--line); padding:14px 24px; display:flex; gap:16px; align-items:center; flex-wrap:wrap; }
  header h1 { font-size:18px; margin:0 auto 0 0; } header label { color:var(--muted); }
  main { padding:8px 24px 64px; max-width:1800px; margin:0 auto; }
  h2 { font-size:20px; margin:32px 0 12px; } h2 span { color:var(--muted); font-weight:500; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(min(100%, 520px), 1fr)); gap:20px; }
  .tile { background:var(--card); border:1px solid var(--line); border-radius:14px; overflow:hidden; }
  video, .missing { display:block; width:100%; aspect-ratio:16/9; background:#e9edf3; }
  .missing { display:flex; align-items:center; justify-content:center; color:var(--muted); }
  .meta { padding:14px 16px 16px; } .meta p { margin:6px 0 10px; color:var(--muted); }
  .row { display:flex; align-items:center; gap:8px; } h3 { margin:0 auto 0 0; font-size:16px; }
  code { font-size:13px; color:var(--muted); }
  .badge { font-size:12px; font-weight:600; padding:2px 10px; border-radius:99px; text-transform:uppercase; letter-spacing:.04em; }
  .badge.draft { background:#fff4e0; color:#b26a00; } .badge.approved { background:#e7f8f1; color:#0b8f63; } .badge.changed { background:#eeedff; color:#4b44d6; }
  button, .actions a { font:inherit; font-size:13px; padding:4px 10px; border:1px solid var(--line); border-radius:8px; background:#fff; color:var(--ink); cursor:pointer; text-decoration:none; }
  button.on { background:var(--accent); border-color:var(--accent); color:#fff; } .actions a { margin-left:auto; }
  [hidden] { display:none !important; }
</style></head><body>
<header>
  <h1>Transition Review</h1>
  <span>${counts.approved} approved · ${counts.changed} changed · ${counts.draft} draft</span>
  <label><input type="checkbox" id="pending"> only needing review</label>
  <span class="row">All: <button data-all="1">1×</button><button data-all="0.5">½×</button><button data-all="0.25">¼×</button></span>
</header>
<main>${sections || "<p>No transitions yet.</p>"}</main>
<script>
  const setRate = (tile, r) => { const v = tile.querySelector("video"); if (v) v.playbackRate = r;
    tile.querySelectorAll("[data-rate]").forEach(b => b.classList.toggle("on", +b.dataset.rate === r)); };
  document.querySelectorAll(".tile").forEach(t => { setRate(t, 1);
    t.querySelectorAll("[data-rate]").forEach(b => b.onclick = () => setRate(t, +b.dataset.rate));
    const r = t.querySelector("[data-restart]"); r.onclick = () => { const v = t.querySelector("video"); if (v) { v.currentTime = 0; v.play(); } }; });
  document.querySelectorAll("[data-all]").forEach(b => b.onclick = () => document.querySelectorAll(".tile").forEach(t => setRate(t, +b.dataset.all)));
  document.getElementById("pending").onchange = e => document.querySelectorAll(".tile").forEach(t => t.hidden = e.target.checked && t.dataset.status === "approved");
</script>
</body></html>`;

mkdirSync(join(ROOT, "review"), { recursive: true });
const tmp = join(ROOT, "review", `.index.${process.pid}.html`);
writeFileSync(tmp, html);
renameSync(tmp, join(ROOT, "review", "index.html")); // atomic: parallel renders may rebuild at once
console.log(`review/index.html: ${items.length} transitions`);
