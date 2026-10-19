# Authoring a transition

The reference implementation is [transitions/ui-deep-zoom](../transitions/ui-deep-zoom/). Match its file layout, SKILL.md shape and demo structure.

## Files

```
transitions/<slug>/
  SKILL.md      the subskill (template below)
  demo.html     two-scene HyperFrames composition
  preview.mp4   written by scripts/render.sh
  contact.png   written by scripts/render.sh
```

`<slug>` is kebab-case and matches the `name:` in the frontmatter.

## demo.html contract

- **Canvas.** 1920×1080 and 30fps (the render script passes `--fps 30`). Root `data-duration` is 3.5–6s. Scene A gets about 1.2–2s to establish, then the transition, then scene B holds at least 1.2s after it lands.
- **Head.** Include `<meta name="hf-transition" content="start=<T>;duration=<D>">`, the GSAP 3.14.2 CDN script, and `<link rel="stylesheet" href="../../shared/ui-kit.css" />`. `T`/`D` must match the script; the render script uses them to frame `contact.png`.
- **Scenes.** `<div id="s1" class="scene">` is visible. Later scenes use `class="scene next"` (opacity 0) and get revealed by the timeline. Never put `class="clip"` on scene divs. Only `#root` carries `data-composition-id` / `data-start` / `data-duration` / `data-width` / `data-height`.
- **Camera layer.** When a scene moves as a camera (scale, pan, tilt), wrap its content in `<div class="cam">` and transform that layer. Put `filter` (blur, brightness) on the unscaled scene div: a filter on a scaled element gets multiplied by the scale.
- **3D.** Put `perspective` on the parent and `transform-style: preserve-3d` on the moving layer. Keep `rotationX/Y` under about 70° unless the move is a flip. Set `backface-visibility: hidden` on flip faces.
- **Timeline.** Use one `gsap.timeline({ paused: true })`, registered as `window.__timelines["main"] = tl; tl.seek(0);`. State flips use `tl.set(...)` at a time, never `onComplete`. Prefer `fromTo` over `from`. Don't use `Math.random`, `Date`, or anything that differs between seeks. If you need a pseudo-random spread, use a seeded formula on the index.
- **Geometry.** Hard-code the coordinates the motion depends on (target boxes, match-cut positions) in CSS and mirror them as JS constants. Never measure with `getBoundingClientRect` at load.
- **Entrances.** Scene A elements animate in during the first ~0.6s. Scene B elements arrive *as part of* the transition's landing. Don't add exit animations: the transition is the exit.
- **Content.** Build both scenes from the kit below so all demos read as one product ("Northwind", a fictional analytics/workflow SaaS). Scene B should plausibly be the next step of the story told by scene A. The transition's mechanic must be the star: keep scenes clean, and keep the element the transition hinges on large and legible.
- **Self-contained.** No external assets besides GSAP and the kit. Use inline SVG for icons and logos. Fonts: Inter and JetBrains Mono (embedded by the compiler).

## Kit reference (`ui-kit.css`)

Tokens: `--bg #f6f8fb`, `--surface #fff`, `--surface-2 #f1f4f9`, `--border #e3e8ef`, `--ink #0a2540`, `--ink-2 #425466`, `--muted #8898aa`, `--accent #635bff` (indigo), `--accent-soft`, `--sky`, `--teal`, `--amber`, `--pink`, `--green`, `--red`, `--radius 16px`, `--radius-sm 10px`, `--shadow`, `--shadow-lg`, `--mono`.

| Area | Classes |
| --- | --- |
| Scene / layout | `.scene`, `.scene.next`, `.cam` (define it per demo: `position:absolute; inset:0`), `.center`, `.dots` (dot-grid canvas), `.grid-2`, `.grid-3` |
| Type | `.eyebrow`, `.display` (112px), `.h1` (64px), `.h2` (40px), `.h3` (24px), `.body`, `.small`, `.mono` |
| App window | `.app` (1680×920 at 120,80; grid 248px + 1fr), `.app-sidebar`, `.brand` + `.brand-mark`, `.nav-item(.active)` + `.nav-icon`, `.app-body`, `.app-topbar`, `.page-title`, `.search`, `.app-content` |
| Data | `.card`, `.card-label`, `.card-value`, `.delta.up/.down`, `.bars` > `.bar(.soft)` (set `height:%` inline), `.chart-svg`, `.chart-line`, `.chart-area`, `.chart-grid`, `.legend`, `.table` > `.tr(.head)` > `.cell-main`, `.pill(.green/.amber/.indigo/.pink)` |
| People | `.avatar(.sky/.pink/.amber/.teal/.lg)` with initials |
| Controls | `.btn`, `.btn-primary`, `.input`, `.toggle(.on)` > `.knob`, `.slider` > `.fill` + `.thumb` |
| Overlays | `.modal`, `.dropdown` > `.menu-item(.active)`, `.toast` > `i` |
| Code / AI | `.code` with `.tok-k/.tok-s/.tok-f/.tok-c/.tok-n`, `.prompt` > `.send`, `.caret` |
| Boards | `.kanban` > `.col` > `.col-title` + `.ticket` |
| Devices | `.laptop` > `.laptop-screen` > `.screen`, then `.laptop-base`; `.phone` > `.screen` |
| Pointer | `.cursor` (wrap an inline SVG arrow), `.ripple` |

Cursor SVG:

```html
<svg class="cursor" viewBox="0 0 40 40"><path d="M8 4 L8 32 L15 25 L20 36 L25 34 L20 23 L30 23 Z" fill="#0a2540" stroke="#fff" stroke-width="2.5" stroke-linejoin="round"/></svg>
```

Position elements absolutely in scene pixels when the motion depends on them. Flow layout is fine for everything else. Override kit styles in the demo's own `<style>` when needed. Don't edit `ui-kit.css` from a single demo; propose kit changes separately.

## SKILL.md template

```markdown
---
name: <slug>
title: <Human Title>
category: camera-spatial | morphing | ui-native | masking | match-cuts | soft
duration: <D>s (<frames>f @ 30fps)
energy: calm | medium | medium-high | high
description: <one sentence: what moves, and what it becomes. Used by the gallery and the index.>
---

# <Title> (<alt name>)

<2–3 sentences: the mechanic, and what it communicates to the viewer.>

![contact sheet](contact.png)

## Use it when
<bullets with concrete SaaS situations; link sibling transitions with relative links ../<slug>/SKILL.md>
<one line on when to avoid it, and what to use instead>

## Anatomy (30fps)
<table: Beat | Frames | What happens. Frame 0 = transition start.>

## Build it
<one line on the DOM structure it needs, then the essential GSAP block (the transition only, not the whole demo), commented only where the why isn't obvious. Then: "The full working composition is in [demo.html](demo.html).">

## Tuning
<3–5 bullets: the knobs and their safe ranges>

## Pitfalls
<3–6 bullets: what breaks and why, especially ones you hit while building>

## Variants
<2–4 bullets>

## Sound
<one line: the foley pairing and where its peak lands>
```

Keep it under about 120 lines. Write plain, specific prose: name the frame, the value or the property. Don't hype it.

## Render and self-check

```bash
scripts/render.sh <slug>
```

This renders `preview.mp4` (strict lint, so lint errors fail the render), writes `contact.png`, and rebuilds the gallery. Then **read `contact.png`** and check each item:

1. Scene A reads as clean product UI before the move. There is no layout overflow, clipped text or overlapping elements.
2. The mechanic is unmistakable. Someone who knows the transition's name would recognize it from the contact sheet alone.
3. The handoff has no flash, gap, double exposure, wrong background color or empty frame, unless empty is intended.
4. Motion has acceleration and settle (spacing between frames changes), not constant speed.
5. Scene B lands cleanly, and its content is fully on-screen by the end of the clip.

For more detail, extract single frames: `ffmpeg -ss <t> -i transitions/<slug>/preview.mp4 -frames:v 1 /tmp/f.png`. Iterate until all five pass.

## Review and commit (humans gate this)

The gallery shows every transition with its status: **draft** (never committed), **approved** (committed and unchanged), **changed** (committed, then edited). Only after a person approves a render:

1. Add its row to the index table in the root `SKILL.md`, keeping category order.
2. Commit only that transition and the index: `git add transitions/<slug> SKILL.md && git commit -m "Add <slug> transition"`.

Never commit a transition whose render hasn't been reviewed.
