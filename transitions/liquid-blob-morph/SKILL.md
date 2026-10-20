---
name: liquid-blob-morph
title: Liquid Blob Morph
category: morphing
duration: 0.8s (24f @ 30fps)
energy: medium-high
description: A pressed button melts into a wobbling indigo blob that splashes droplets and floods the frame, then the next scene opens through an organic, lavender-rimmed hole in the liquid.
---

# Liquid Blob Morph (goo flood / liquid reveal)

The fill of a UI element turns into liquid: it swells into an irregular drop, throws off droplets, and surges past the frame edges. A second blob then opens a hole in that flood, and scene B shows through it as the liquid drains off the corners. It says "this is friendly, and something just happened" more than any geometric wipe does.

![contact sheet](contact.png)

## Use it when

- A playful CTA opens the product in a consumer or prosumer SaaS: "Open workspace", "Get started", signup → welcome, onboarding done → first board.
- The brand is soft and rounded and an accent fill can carry the whole frame for a few frames.
- You want a morph that ends in a new scene, not a new component. For component to component use [ui-component-morph](../ui-component-morph/SKILL.md). For icon to UI use [icon-to-scene-morph](../icon-to-scene-morph/SKILL.md).

Avoid it in serious tones (security, finance, enterprise admin), where it reads as a toy. Use [ui-deep-zoom](../ui-deep-zoom/SKILL.md) for a CTA, or [container-mask-expand](../container-mask-expand/SKILL.md) for a card.

## Anatomy (30fps)

| Beat | Frames | What happens |
| --- | --- | --- |
| Telegraph | −26 → 0 | The cursor glides onto the button (f−26 → −8) and clicks at f−6. A ripple and a 0.97 press start at f−5. The label and arrow fade over f−3 → 0, and the cursor fades out with them. |
| Swell | 0 → 4 | The flood path starts as the ellipse inscribed in the pill (same fill, so invisible) and bulges into a wobbling ~170px drop (`power2.out` over the first 30%). By f3 the pill's ends are swallowed, and `#cta` is hidden at f4 while the drop still covers it all. A lavender lead slides out from behind the indigo over f0 → 3. |
| Splash | 2 → 12 | Five droplets pinch off at f2/f3. A goo filter draws the necks. They fly out on `power3.out` and the surge swallows them again. |
| Surge | 4 → 12 | The radius gains `1600·u⁴` while the centre drifts 364px up toward (930, 470) on `power2.inOut`. The last corner fills at f12. |
| Open | 10 → 23 | Scene B switches on at f10, clipped to a zero-area path. A hole grows from (1020, 470), over the In progress tickets (text shows from f12), on `power1.inOut` with a lavender rim 1% ahead and 55px wider (about 55–80px thick). The indigo is gone at f22, and the lavender drains off the bottom-left corner by f23. |
| Handoff | 24 | The clip path is removed and scene A plus the liquid are hidden. Nothing visible changes. |
| Land | 10 → 37 | The app scales 1.05 → 1 (`expo.out`, 27f). Columns rise 48px from the centre out, then tickets settle with `back.out(1.2)`. The motion happens inside the opening hole, without opacity. |

## Build it

Structure: `#s1` (z 0) › `svg#liquid` (z 1: `g[filter=goo]` › `#lead`, `g[filter=goo]` › `#flood` + droplets, then `#rim`, with `clipPath#reveal` › `#reveal-path` in its defs) › `#s2` (z 2, `clip-path: url(#reveal)`). The goo filter is `feGaussianBlur 10` followed by an alpha matrix `0 0 0 22 -9`.

```js
const FPS = 30, T = 1.6, FLOOD_F = 13, REVEAL_AT = 10, REVEAL_F = 14; // reveal starts 3f before the flood lands
const D = (REVEAL_AT + REVEAL_F) / FPS;                                // 24f = 0.8s
const BTN = { x: 760, y: 790, w: 400, h: 88 }, bx = BTN.x + BTN.w / 2, by = BTN.y + BTN.h / 2; // hard-coded from CSS
const FLOOD_TO = { x: 930, y: 470 }, REVEAL_FROM = { x: 1020, y: 470 }, REVEAL_TO = { x: 960, y: 540 }, N = 20;
// [harmonic, amplitude, phase, wobble]: harmonics 2/3/5 never line up, so the outline never repeats
const FLOOD_LOBES = [[2, 0.1, 0.4, 3.4], [3, 0.08, 2.6, -4.6], [5, 0.05, 1.1, 6.2]];
const REVEAL_LOBES = [[2, 0.1, 1.9, -2.4], [3, 0.06, 0.3, 2.8], [4, 0.04, 2.2, -3.6]];
const RIM_LOBES = REVEAL_LOBES.map(([n, a, p, w]) => [n, a, p - 0.15, w]);
const wobble = (ang, lobes, t) => lobes.reduce((k, [n, amp, ph, w]) => k + amp * Math.sin(n * ang + ph + w * t), 1);
const startR = (ang) => 1 / Math.hypot(Math.cos(ang) / (BTN.w / 2 - 4), Math.sin(ang) / (BTN.h / 2 - 3));
// Closed Catmull-Rom spline as "M + N×C + Z": every frame has the same commands and number count,
// which is what lets GSAP interpolate attr:d without MorphSVG.
function smoothPath(pts) {
  const n = pts.length, P = (i) => pts[(i + n) % n], f = (v) => v.toFixed(1);
  let d = `M${f(pts[0][0])},${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = P(i - 1), [x1, y1] = P(i), [x2, y2] = P(i + 1), [x3, y3] = P(i + 2);
    d += `C${f(x1 + (x2 - x0) / 6)},${f(y1 + (y2 - y0) / 6)} ${f(x2 - (x3 - x1) / 6)},${f(y2 - (y3 - y1) / 6)} ${f(x2)},${f(y2)}`;
  }
  return d + "Z";
}
function blob(cx, cy, radius) { // radius(angle) -> px
  const pts = [];
  for (let i = 0; i < N; i++) { const ang = (i / N) * Math.PI * 2, r = radius(ang); pts.push([cx + Math.cos(ang) * r, cy + Math.sin(ang) * r]); }
  return smoothPath(pts);
}
const [swell, surge, drift, open] = ["power2.out", "power3.in", "power2.inOut", "power1.inOut"].map((e) => gsap.parseEase(e));
const clamp01 = (v) => Math.min(Math.max(v, 0), 1);
function floodShape(u, lobes, grow = 1, pad = 0, start = 1) {
  const m = swell(clamp01(u / 0.3)); // 0 → 1: button ellipse → free blob
  const r = (70 + 100 * swell(clamp01(u / 0.35)) + 1600 * surge(u)) * grow + pad;
  const cx = bx + (FLOOD_TO.x - bx) * drift(u), cy = by + (FLOOD_TO.y - by) * drift(u);
  return blob(cx, cy, (a) => startR(a) * start + (r * wobble(a, lobes, u) - startR(a) * start) * m);
}
function revealShape(v, lobes, pad) {
  const r = 1320 * open(v) + pad; // clears the last corner at f23, 1f before the handoff
  const cx = REVEAL_FROM.x + (REVEAL_TO.x - REVEAL_FROM.x) * v, cy = REVEAL_FROM.y + (REVEAL_TO.y - REVEAL_FROM.y) * v;
  return blob(cx, cy, (a) => r * wobble(a, lobes, v));
}
function bake(sel, start, frames, shape) { // one keyframe per frame from a pure function: seek-safe, no onUpdate
  tl.set(sel, { attr: { d: shape(0) } }, start);
  for (let i = 1; i <= frames; i++) tl.to(sel, { attr: { d: shape(i / frames) }, duration: 1 / FPS, ease: "none" }, start + (i - 1) / FPS);
}
tl.set("#lead, #flood", { attr: { d: blob(bx, by, () => 0) } }, 0); // zero-area, same structure; never d=""
tl.set("#reveal-path, #rim", { attr: { d: blob(REVEAL_FROM.x, REVEAL_FROM.y, () => 0) } }, 0);
tl.to("#cta-label, #cta-arrow", { opacity: 0, duration: 0.1, ease: "power1.in" }, T - 0.1);
tl.set("#cta", { visibility: "hidden" }, T + 4 / FPS); // fully covered at f3-5; the drift uncovers it at f6
bake("#flood", T, FLOOD_F, (u) => floodShape(u, FLOOD_LOBES));
bake("#lead", T, FLOOD_F, (u) => { // lavender meniscus: starts at 0.9× (hidden), slides out over 3f
  const k = clamp01((u * FLOOD_F) / 3);
  return floodShape(u, FLOOD_LOBES.map(([n, a, p, w]) => [n, a, p + 0.9 * k, w]), 0.9 + 0.17 * k, 26 * k, 0.9);
});
const TR = T + REVEAL_AT / FPS;
tl.set("#s2", { opacity: 1 }, TR);
bake("#reveal-path", TR, REVEAL_F, (v) => revealShape(v, REVEAL_LOBES, 0));
bake("#rim", TR, REVEAL_F, (v) => revealShape(clamp01(v + 0.01), RIM_LOBES, 55));
tl.set("#s2", { clipPath: "none" }, T + D);
tl.set("#s1, #liquid", { visibility: "hidden" }, T + D);
```

The full working composition, including the droplets and scene B's landing, is in [demo.html](demo.html).

## Tuning

- **Flood length (`FLOOD_F`).** 11–15f. Under 10f the swell reads as a pop rather than as liquid gathering.
- **Overlap (`REVEAL_AT`).** Start the hole 2–3f before the flood lands. Any earlier and scene A's last corner and scene B's hole are both on screen for several frames.
- **Lobes.** Keep the summed amplitude at or under about 0.25 (0.23 here) so it reads as a drop, not a star. With N = 20, keep harmonics at 5 or below, because each lobe needs about 4 points or the spline aliases into spikes. Avoid multiples of each other: 2/4/6 reads as a flower.
- **Goo.** Blur 10 with the alpha matrix `22 −9`. Raising the blur fattens the necks between drop and droplets. Lowering it, or steepening the matrix, gives a harder splatter.
- **Reveal radius.** Set it so the hole clears the last corner 1–2f before `T + D` (1320 here, from (1020, 470)). Check with a polar test over the frame edge, not by eye.

## Pitfalls

- **Lead at full offset from frame 0.** On f1 the lavender lead outlined the indigo pill like a sticker, so the button looked stamped instead of melting. Start it at 0.9× inside the flood and ramp the offset and phase over 3f.
- **Overshooting the reveal.** A 16f reveal at `r = 1350` drained the last corner at f23 of a 26f window, so the tail was dead frames. A 14f reveal at 1320 clears it at f23, 1f before the f24 handoff. The radius barely grows over the last 2f while the lobes keep turning, so test it with a polygon check against the frame edge.
- **Leaving the button in scene A.** The flood's centre drifts 364px up, and at f6–7 its lower edge uncovered the pill and its shadow, so the button read as stamped behind the liquid. Hide `#cta` at f4, while the drop fully covers it.
- **Sampling the pill by angle.** Equal angles bunch points on the rounded ends and spread them along the flat sides, so the spline goes wavy. Start from the inscribed ellipse in the same fill.
- **Mismatched path structure.** `attr: { d }` only interpolates numbers pairwise. Every keyframe, including the collapsed start, must come from the same `blob()` (M + 20 C + Z). An empty `d` or a different point count snaps.
- **Filters don't apply inside `<clipPath>`.** The hole can't be gooey. Put the rim as a separate filled path under scene B and let its offset sell the liquid edge. Keep its lobes within ~0.15 rad of the hole's and its lead at ~1%: at 0.7 rad and 6% it was 190px thick mid-reveal and went to zero thickness late, so indigo touched scene B.
- **Kit cursor above the liquid.** `.cursor` has `z-index: 50`. Give `#s1` its own stacking context (`z-index: 0`), or the cursor floats over the flood.

## Variants

- **Splat to colour.** Skip the hole. The flood lands and scene B's background is the accent, as in [ui-deep-zoom](../ui-deep-zoom/SKILL.md)'s cover.
- **Drain back.** Bake the flood with `u → 1 − u` to pour scene B back into a button, for a return to a CTA.
- **Directional pour.** Move `FLOOD_TO` toward a frame edge so the liquid pours sideways like a wipe.

## Sound

A wet "bloop" on the click (f−5), then a soft rising synth swell that peaks at full cover (f12) and opens into an airy release as the hole grows.
