---
name: whip-pan
title: Whip Pan
category: camera-spatial
duration: 0.43s (26f @ 60fps)
energy: high
description: The camera whips sideways to peak speed under heavy horizontal motion blur, and a hard cut at the fastest frame lands on an unrelated module decelerating in from the other side.
---

# Whip Pan (swish pan)

The camera accelerates hard to one side until scene A is a horizontal smear. On the fastest frame there is a hard cut, and scene B arrives from the opposite edge already at that speed, then brakes to a stop. Because motion blur is heaviest at the cut, the viewer reads one continuous camera move, not two screens. It says "meanwhile, over here": a jump across the product with no spatial link required.

![contact sheet](contact.png)

## Use it when

- Feature montages that jump between modules that share nothing to match on: Billing → Integrations → Reports.
- "It also does X" beats in a launch video, where pace matters more than showing how the screens connect.
- Jumping between sibling tabs or workspaces in a product tour, where the navigation itself isn't the point.

Avoid it when scene B is a detail of scene A. Use [ui-deep-zoom](../ui-deep-zoom/SKILL.md) or [shared-element](../shared-element/SKILL.md) for that. Two whips in a row read as a template. If both scenes have a shape you can line up, a [speed-match-cut](../speed-match-cut/SKILL.md) is cleaner. If the two modules really are neighbours on one canvas and the trip matters, use [infinite-canvas-pan](../infinite-canvas-pan/SKILL.md), the slow version of the same move.

## Anatomy (60fps)

| Beat | Frames | What happens |
| --- | --- | --- |
| Telegraph | −18 → 0 | The camera winds up 20px against the direction of travel (`sine.inOut`) and stops. |
| Whip out | 0 → 12 | Scene A's `.cam` moves x +20 → −1380 on `power4.in`, in per-frame steps of 0, 1, 4, 12, 25, 45, 75, 114, 166, 232 and 313px. Horizontal blur `stdDeviation` goes 0 → 90 on `power3.in`, so it tracks speed. Off-frame modules (amber, pink) streak in from the right on f8–11. |
| Cut | 12 | Scene A is hidden. Scene B is shown at x +943 with blur 90. Both sides move at 28,000 px/s (about 467px per frame). The same amber and pink streaks sit on B's side of the cut, so the smear reads as continuous. |
| Land | 12 → 26 | Scene B's `.cam` moves 943 → 0 on `expo.out`, in steps of 368, 224, 137, 83, 51, 31, 19, 12, 7 and 4px. The blur goes 90 → 0 on `expo.out`. B is readable by f18 and still by f24. |
| Drag | 12 → 48 | The tile columns trail the camera by 40–160px (right column most) and settle on `expo.out`. |

## Build it

Structure: each scene is `#sN.scene` (unscaled, carries `filter: url(#whipN)`) › `.cam` (carries `x`) › a wide dot-grid layer, the app window, and off-frame "ghost" modules. One inline `<svg width="0" height="0">` holds a `<filter id="whipN" color-interpolation-filters="sRGB">` with `<feGaussianBlur id="blurN" stdDeviation="0 0">` for each scene.

```js
const T = 1.6;        // whip start (frame 96)
const DA = 12 / 60;   // scene A out: 12f, power4.in
const DB = 14 / 60;   // scene B in: 14f, expo.out
const CUT = T + DA;   // hard cut at peak velocity (frame 108)
const XA = 1400;      // scene A travel, px
const V = (4 * XA) / DA;                // exit speed of power4.in: x'(1) = 4·XA/DA = 28000 px/s
const XB = (V * DB) / (10 * Math.LN2);  // expo.out enters at 10·ln2·XB/DB, so solve for the same speed (~943px)
const FPS = 60;       // render frame rate
const BLUR = 180 * 30 / FPS; // peak horizontal stdDeviation: 180px was tuned at 30fps; each 60fps frame covers half the travel

tl.to("#s1 .cam", { x: 20, duration: 0.3, ease: "sine.inOut" }, T - 0.3); // wind-up
tl.to("#s1 .cam", { x: 20 - XA, duration: DA, ease: "power4.in" }, T);
// Blur tracks speed. d/dp of power4.in is 4p³, so power3.in on the blur keeps it proportional.
tl.fromTo("#blurA", { attr: { stdDeviation: "0 0" } }, { attr: { stdDeviation: `${BLUR} 0` }, duration: DA, ease: "power3.in" }, T);

tl.set("#s1", { visibility: "hidden" }, CUT);
tl.set("#s2", { opacity: 1 }, CUT);

tl.fromTo("#s2 .cam", { x: XB }, { x: 0, duration: DB, ease: "expo.out" }, CUT);
// expo.out's speed decays as 2^(-10p), the same shape as 1 - expo.out, so the blur tween uses expo.out too.
tl.fromTo("#blurB", { attr: { stdDeviation: `${BLUR} 0` } }, { attr: { stdDeviation: "0 0" }, duration: DB, ease: "expo.out" }, CUT);
tl.fromTo("#s2 .tile", { x: (i) => 40 + (i % 4) * 40 }, { x: 0, duration: 0.6, ease: "expo.out" }, CUT); // drag
```

The full working composition is in [demo.html](demo.html).

## Tuning

- **Travel (`XA`, 1000–1800px).** Peak speed scales with it. Below roughly 300px per frame at the cut, the move reads as a fast push rather than a whip.
- **Peak blur (`BLUR`, 60–120).** Roughly the peak px-per-frame ÷ 5. In the demo, a blur of 33 (f14) already shows the tile grid, so a peak much under 50 leaves the cut frame readable.
- **Durations (`DA` 10–14f, `DB` 12–18f).** Keep both in whole frames, and always recompute `XB` from `V`. A longer `DB` gives a longer settle but pushes `XB` up, so B's first frame shows less of B.
- **Wind-up (0–30px).** More than about 40px reads as a bounce, not a camera operator bracing.
- **Ghost modules.** Two or three cards per side, made of solid colour bars. Under horizontal blur only their vertical layout survives, so they only need matching colours and rows.

## Pitfalls

- **Isotropic blur.** CSS `blur()` smears vertically too, and that reads as defocus ([soft-blur](../soft-blur/SKILL.md)), not speed. Use `feGaussianBlur stdDeviation="X 0"` and tween it with GSAP's `attr`.
- **Bare canvas at the cut.** With only the two app windows, A's last frame is about 40% empty canvas on the right, and B's first frame is 55% empty on the left. The empty half jumps sides and gives the cut away. Fill the canvas beyond each window with ghost modules.
- **Ghosts peeking at rest.** A ghost at `left: 1900px` showed as a 20px sliver on the frame edge during the hold, because of the wind-up plus its shadow. Keep ghosts at least wind-up + 80px outside the frame (2000px here).
- **Perfect streak continuity is impossible.** To continue A's amber streak exactly into the cut frame, B's copy would sit at x −323…237 in B's world, which is on-screen at rest. Pushed off-frame (−470…−70), it lands 150–300px short on the cut frame. At 467px per frame, nobody can see that.
- **Eyeballed `XB`.** If B enters slower than A left, the cut reads as two moves (whip, then a separate push). If it enters faster, B lurches. Derive it: power4.in exits at `4·XA/DA` and expo.out enters at `10·ln2·XB/DB`.
- **Cut off the frame grid.** If `T + DA` falls between frames, the last frame of A is near p = 1, and the window is almost entirely off-frame. Express the durations in frames. In the demo, frame 108 is the first frame of B.

## Variants

- **Vertical whip.** Use `y` and `stdDeviation="0 Y"` for modules stacked like a scroll, such as a changelog or a feed.
- **Rolling-shutter skew.** Add `skewX` up to ±6°, peaking at the cut (negative on A, positive on B), for a handheld, documentary feel.
- **Whip and back.** A → B → A′ with the second whip in the opposite direction, for before/after comparisons.
- **Brand smear.** Make the ghost modules solid brand colours so the peak frame becomes a band of brand colour.

## Sound

A short air whoosh, panned in the direction of travel, peaking on the cut frame (f12), plus a soft tick when B stops (about f20).
