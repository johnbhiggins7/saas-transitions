---
name: bento-cascade
title: Bento Cascade
category: ui-native
duration: 0.8s (48f @ 60fps)
energy: medium
description: The tiles of a bento grid resize and reposition one after another into a new bento arrangement, swapping their contents mid-move and settling with a small spring overshoot.
---

# Bento Cascade (bento rearrange)

Every tile of a bento grid keeps its card but moves to a new cell and size. The tiles go one after another, 3f apart, each crossfading its contents while in flight and landing with a 5.3% spring overshoot. The gaps are the same 24px before and after. The grid itself never cuts, so the viewer reads it as one product reorganising itself around a new task, not as a new screen.

![contact sheet](contact.png)

## Use it when

- A dashboard switches view, tab or preset: Insights → Automations, Sales → Support, "customize your dashboard".
- A launch or feature video moves from one group of features to the next and both groups should feel like one system.
- One small tile should become the hero of the next layout. In the demo, the 1×1 "Automations" teaser grows into the 2×2 flow builder.
- If a single layout should adapt (desktop → tablet, sidebar collapse), use [component-reflow](../component-reflow/SKILL.md). If one card matters more than the grid, use [shared-element](../shared-element/SKILL.md).

Avoid it with more than about 8 tiles, or when only one tile changes. Past 8 tiles the stagger turns to noise. For one changing tile use [ui-component-morph](../ui-component-morph/SKILL.md), or [container-mask-expand](../container-mask-expand/SKILL.md) to spotlight one panel.

## Anatomy (60fps)

| Beat | Frames | What happens |
| --- | --- | --- |
| Telegraph | −12 → 6 | The segmented control's pill slides from "Insights" to "Automations" (`x` 0 → 140, `width` 140 → 180, `power3.inOut`), and the label colours swap from −9f. The cause is on screen before the grid moves. |
| Vacate | 0 → 42 | The tiles that shrink or slide out of the way go first: t1 (2×2 → 1×2), t2 (slides one column left), t4 (2×1 → 1×1), t5 (2×1 → 1×1). They start 3f apart, and each moves its real box for 33f on `back.out(1.2)`, which covers ~80% of the distance in the first 10f. |
| Swap | per tile, −2 → 18 | Each tile crossfades face A out and face B in over 6f, both on `power2.out`, so A + B = 100% on every frame and no card is ever empty. Shrinkers (t1, t4, t5) start at −2f, because `back.out` moves the box ~24% (100px) in its first 2 frames and would crop A. The slider (t2) swaps at 3f; both its faces share one layout, so it reads as the numbers changing. Growers (t3, t6) swap at 12f, once the moving edge is within B's 28px face padding (~92%). B also drifts up (`y` 14 → 0, `power3.out`, 21f). |
| Fill | 12 → 48 | The tiles that grow into the freed cells go last: t3 (1×1 → 2×2 hero, growing left and down) at 12f and t6 (2×1 → 3×1) at 15f. The last tile settles on frame 48. |
| Settle | each tile, +21f | Each tile peaks ~22px (5.3%) past its target on a 426px move, then eases back. For example, t2's left edge reaches x 524 against 546 at f24. That is just under the 24px gap: the closest pair (t3 overshooting toward t2, which is still easing back, at f34) gets to ~3px and never touches. |
| Hero fill | 29 → 63 | The flow nodes pop into the new hero 4.8f after its title starts (`scale` 0.9 → 1, `back.out(1.6)`, 4f apart). The wires draw from f35, the wire end-dots fade in from f47, and the last wire finishes at f63. |

## Build it

Structure: one `.scene` with absolutely positioned `.tile` cards (`overflow: hidden`, padding 0). Each holds `.face.a` and `.face.b`, and each face is laid out at its own final size and pinned to a corner.

```js
const F = 1 / 60;                                     // one frame at 60fps
const T = 1.6, MOVE = 0.55, STAGGER = 0.05;           // 33f per tile, 3f apart: D = 0.8s (48f)
const EASE = "back.out(1.2)";                         // 5.3% overshoot; >= 1.4 makes neighbours collide at this stagger
// 4x3 grid of 402x264 cells, 24px gaps, origin (120,172). Hard-coded; A mirrors the CSS.
const cell = (c, r, w, h) => ({ left: 120 + c * 426, top: 172 + r * 288, width: w * 426 - 24, height: h * 288 - 24 });
const A = { t1: cell(0, 0, 2, 2), t2: cell(2, 0, 1, 1), t3: cell(3, 0, 1, 1), t4: cell(2, 1, 2, 1), t5: cell(0, 2, 2, 1), t6: cell(2, 2, 2, 1) };
const B = { t1: cell(0, 0, 1, 2), t2: cell(1, 0, 1, 1), t3: cell(2, 0, 2, 2), t4: cell(1, 1, 1, 1), t5: cell(0, 2, 1, 1), t6: cell(1, 2, 3, 1) };
const ORDER = ["t1", "t2", "t4", "t5", "t3", "t6"];  // vacate before fill, not reading order

tl.fromTo(".seg-pill", { x: 0, width: 140 }, { x: 140, width: 180, duration: 0.3, ease: "power3.inOut" }, T - 0.2);

ORDER.forEach((id, i) => {
  const t0 = T + i * STAGGER;
  // Real box, not scale: scale would stretch the radius, border, shadow and text.
  tl.fromTo(`#${id}`, A[id], { ...B[id], duration: MOVE, ease: EASE, immediateRender: false }, t0);
  // 6f crossfade, same ease on both faces: A + B = 100% on every frame. Shrinkers start 2f early (back.out moves the
  // box ~24% in its first 2 frames and would crop A); growers wait until their moving edge is within B's 28px padding.
  const swap = t0 + { t1: -2 * F, t4: -2 * F, t5: -2 * F, t2: 0.05, t3: 0.2, t6: 0.2 }[id];
  tl.to(`#${id} .a`, { opacity: 0, duration: 0.1, ease: "power2.out" }, swap);
  tl.fromTo(`#${id} .b`, { opacity: 0 }, { opacity: 1, duration: 0.1, ease: "power2.out" }, swap);
  tl.fromTo(`#${id} .b`, { y: 14 }, { y: 0, duration: 0.35, ease: "power3.out" }, swap);
});

const tHero = T + ORDER.indexOf("t3") * STAGGER + 0.28;  // frame 28.8, 4.8f after the hero's title starts
tl.fromTo("#t3 .node", { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, stagger: 0.07, ease: "back.out(1.6)" }, tHero);
```

The full working composition is in [demo.html](demo.html).

## Tuning

- **Stagger (`0.03–0.06s`).** Below 2f it reads as one reflow. Above 4f it reads as a queue, and the last tile lands after 48f.
- **Overshoot (`back.out(1.1–1.3)`).** Keep the overshoot times the longest move under the gap. At 1.2 that is 5.3%, the house rule's named `back.out(1.2)` value (just past the 2–5% band): 0.053 × 426 = 23px, against a 24px gap. At 1.4 (7%) tiles collide by ~2px, and at 1.7 by ~12px. For a calm brand, use `expo.out` (no overshoot).
- **Per-tile move (`0.45–0.6s`).** Shorter stops the overshoot reading as a spring. Longer pushes the cascade past 48f.
- **Swap point.** Crossfade the two faces over 4–8f with the same ease on both, so they always sum to 100%. Never leave a tile with neither face above about 40% for more than 2f. Only where a moving edge crosses B (the growers here) does B have to wait until that edge is within the face padding (28px) of its target: ~92% progress, 12f for `back.out(1.2)` over 33f. Where the box closes on A (shrinkers), start 2f before the move instead; B never clips there.
- **Gap.** If you drop the gap to 16px, lower the overshoot or the stagger with it, because the overshoot is what eats the gap.

## Pitfalls

- **Reading-order stagger collides.** When a tile grows diagonally into a cell its neighbour hasn't left yet, they overlap for most of the move. Here t3 grows into t4's old cell. Order the tiles by dependency (shrinkers and sliders first, growers last). Then pick the scene B layout and mapping so that order exists. Simulated frame by frame, the demo's mapping in reading order (t1 → t6) overlaps t3 and t4 by up to 208px around f16; in the dependency order above the closest pair keeps 3.4px.
- **Faces that reflow.** If face content uses flow layout at 100% of the tile, text rewraps and bars squash on every frame of the resize. Give each face a fixed size equal to its own final tile size.
- **Fade-out and fade-in on separate clocks.** Fading A and B on separate eases either crops face A on shrinking tiles or leaves cards blank around f10. Crossfade both in one window on one ease. On shrinkers that window opens 2f before the box moves; the lead is part of the swap, not an exit.
- **Face pinned to the moving edge.** t6 and t3 grow leftward while their right edge stays put. Pinning face B `right: 0` keeps its content from sliding, but the clip still runs along the moving left edge, where the titles sit. At 10f, "Win-back flow" showed as "-back flow". The new face must also wait until that edge is within the face padding of its target (12f here).
- **Decoration outside the entrance tweens.** The flow's wire end-dots had no tween, so they floated in an empty canvas before the nodes arrived. Every child of the incoming face needs its own entrance, or it shows up early.
- **Scale-based FLIP.** Animating `scaleX/scaleY` from the old box to the new one distorts the 16px corners, the 1px border and the text. Tween `left/top/width/height`. The render is frame-by-frame, so layout cost doesn't matter.

## Variants

- **Hero promote.** Only 2–3 tiles move: one tile grows to 2×2 and its neighbours shuffle around it. Calmer, and good for "this feature matters".
- **Break apart.** Scene A tiles fly out on their own vectors while the scene B tiles cascade in from below on the same stagger. Use it when the two layouts share no tiles.
- **Return trip.** Run the same tweens backwards (B → A) with the order reversed, which turns it into fill-before-vacate. Re-check the gaps.
- **Filter cascade.** A filter chip removes tiles (`scale` → 0.9, opacity → 0), and the rest cascade into the freed cells.

## Sound

A run of soft UI ticks, one per tile and 3f apart, over a low air swell that peaks around frame 20–24 as most tiles hit their overshoot. Add a light chime on the hero pop at frame 29.
