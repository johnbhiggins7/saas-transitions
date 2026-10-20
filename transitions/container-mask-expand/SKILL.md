---
name: container-mask-expand
title: Expanding Container Mask
category: masking
duration: 0.6s (36f @ 60fps)
energy: medium
description: A bento card that already shows a crop of the next scene grows its clip-path to the full frame, revealing scene B in place while the dashboard recedes and dims.
---

# Expanding Container Mask (matte window)

One card in a busy dashboard is a window: it already shows a crop of scene B. The window's mask grows from the card's rect to the full frame, while the content behind it stays put and gets uncovered. The surrounding panels sink back. The card was never a thumbnail, only a cut-out of a bigger view. That says "here's the rest of it."

![contact sheet](contact.png)

## Use it when

- A dashboard tile previews a feature: a live map, flow canvas, session replay, video or chart. Scene B is that feature at full size.
- You want to spotlight one panel of a multi-panel layout without moving the camera. To travel *into* a small solid element, use [ui-deep-zoom](../ui-deep-zoom/SKILL.md). To show the click that opens it, use [cursor-click-expand](../cursor-click-expand/SKILL.md).
- Pair it with [contextual-pullback](../contextual-pullback/SKILL.md) or a reversed mask for the return to the dashboard.

Avoid it when scene B can't be laid out so that the card's rect frames a complete-looking crop of it. If the card's own UI should *become* scene B's UI, use [shared-element](../shared-element/SKILL.md) or [ui-component-morph](../ui-component-morph/SKILL.md) instead.

## Anatomy (60fps)

| Beat | Frames | What happens |
| --- | --- | --- |
| Telegraph | −24 → 0 | An indigo ring (box-shadow spread 0 → 22px) leaves the card. At −10 the card's expand control presses (scale 0.86, 6f down and 6f back up). Scene B's flow dashes have been moving inside the window since frame −96. |
| Lift | 0 → 10 | The window's label and Live pill fade out (0 → 9). A tracking shadow fades up (0 → 14). `expo.inOut` holds the mask edges within 2.3% of the card, so the card seems to lift before it opens. |
| Open | 10 → 24 | The mask sweeps: the left inset goes 844 → 802px at f12, 422px at f18 (half-way) and 42px at f24. The nodes inside never move. Scene A's `.cam` scales toward 0.96 around the card's center while brightness drops toward 0.78. Both are at 0.98 and 0.89 on f18. |
| Settle | 24 → 36 | The last 5%: a thin strip of dimmed dashboard closes on all four sides (42 → 4px on the left by f30), and the corner radius runs out (0.8px at f24). Scene A is hidden on f36. |
| Land | 18 → 64 | Only content the window never showed arrives: the headline rises 32px from f18 and the stat strip from f22 (stagger 3f), both on `expo.out`. |

## Build it

Structure: `#s1` (unscaled, carries `filter`) › `.cam` (carries `transform`) › dashboard with `#win`, a solid card with the same fill as scene B. `#s2` is a full-frame scene laid out in *frame* coordinates, with `clip-path` set to the card's rect from the start. `#win-shadow` sits between the two scenes. It is an empty div that carries only an outer box-shadow.

```js
const T = 1.6, D = 0.6;
const WIN = { x: 844, y: 188, w: 924, h: 512, r: 16 };   // card box in frame px; hard-code it, don't measure at load
const clip = (dy = 0) =>
  `inset(${WIN.y + dy}px ${1920 - WIN.x - WIN.w}px ${1080 - WIN.y - WIN.h - dy}px ${WIN.x}px round ${WIN.r}px)`;
const FULL = "inset(0px 0px 0px 0px round 0px)";          // same token count and units as clip(), or it won't interpolate
const cx = WIN.x + WIN.w / 2, cy = WIN.y + WIN.h / 2;

tl.fromTo("#win-ring", { boxShadow: "0 0 0 0px rgba(99,91,255,0.55)" }, { boxShadow: "0 0 0 22px rgba(99,91,255,0)", duration: 0.5, ease: "power2.out" }, T - 0.4);
tl.to("#expand", { scale: 0.86, duration: 0.1, ease: "power2.out", yoyo: true, repeat: 1 }, T - 0.16);
tl.to("#win-chrome", { opacity: 0, duration: 0.15, ease: "power1.in" }, T);

// The mask grows; #s2's content doesn't move. immediateRender:false because the entrance already tweens clipPath.
tl.fromTo("#s2", { clipPath: clip(0) }, { clipPath: FULL, duration: D, ease: "expo.inOut", immediateRender: false }, T);
tl.fromTo("#win-shadow", { x: WIN.x, y: WIN.y, width: WIN.w, height: WIN.h, borderRadius: WIN.r },
  { x: 0, y: 0, width: 1920, height: 1080, borderRadius: 0, duration: D, ease: "expo.inOut", immediateRender: false }, T);
tl.fromTo("#win-shadow", { opacity: 0 }, { opacity: 1, duration: D * 0.4, ease: "power2.out", immediateRender: false }, T);

// Recede around the card's center so the shrinking card stays inside the growing mask.
tl.set("#s1 .cam", { transformOrigin: `${cx}px ${cy}px` }, 0);
tl.to("#s1 .cam", { scale: 0.96, duration: D, ease: "expo.inOut" }, T);
tl.fromTo("#s1", { filter: "brightness(1)" }, { filter: "brightness(0.78)", duration: D, ease: "expo.inOut", immediateRender: false }, T);
tl.set("#s1", { visibility: "hidden" }, T + D);

tl.fromTo("#s2 .copy", { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "expo.out" }, T + 0.3);
tl.fromTo("#s2 .stat", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: "expo.out" }, T + 0.36);
```

The full working composition is in [demo.html](demo.html). It also has the entrance, where the clip rises 24px with its card.

## Tuning

- **Duration.** 0.5–0.7s. `expo.inOut` spends about 10f at each end nearly still, so the visible sweep is only about 14f. Under 0.5s it pops like a cut.
- **Curve.** `expo.inOut` gives the lift-then-open feel. `power3.inOut` starts the sweep about 6f earlier and reads calmer. Plain `expo.out` drops the lift beat: the mask moves at full speed on f1. Most of the sweep lands between f16 and f20 (≈450px); `power4.inOut` spreads it over about 8 more frames if that reads too abrupt for your content.
- **Push-back.** Use scale 0.95–0.98 and brightness 0.7–0.85. Below about 0.93 it reads as a camera pull-out competing with the mask.
- **Window size.** Keep the card at 20% of the frame or more (the demo uses 23%) and fill its crop with something complete, here three nodes and their edges. A thumbnail-sized window doesn't sell the "already there" idea.

## Pitfalls

- **`filter` tweened from `none`.** `to({ filter: "brightness(0.78)" })` interpolates from `brightness(0)`, and the first render flashed scene A black for 12f. Use `fromTo` with `brightness(1)`.
- **Shadow on the clipped scene.** `box-shadow` and `filter: drop-shadow` on `#s2` are clipped by its own `clip-path` (filter runs before clip). Use a separate tracker div on the same ease. Without it, the window is a flat cut-out against the dimming UI.
- **`left`/`top` on the tracker.** Strict lint rejects them because they snap to whole pixels and stutter in expo's slow tail. Move it with `x`/`y`. Width and height are fine under an 80px blur.
- **Two clipPath tweens on one element.** The entrance and the expansion both tween `#s2`'s clip. Without `immediateRender: false`, the second `fromTo` stamps `clip(0)` at seek(0) and the entrance starts from the wrong rect.
- **Scaling scene A around the frame center.** The card drifts sideways while the mask's first frames barely move, and a light sliver of the card shows beside the dark window. Scale around the card's center.
- **Radius left at 16px.** The four frame corners would show scene A for the last frames. Tween `round` to 0 in the same string.

## Variants

- **Video window.** The card holds the product video at full-frame size from the start. The expansion is the "watch it" moment.
- **Reverse collapse.** Run the mask from full frame down to a card in a new dashboard to close a feature chapter.
- **Two-stage unfold.** Start the top and bottom insets 6f after left and right, so the panel widens, then grows taller.
- **Circle iris.** Use `circle(r at x y)` from an avatar or map pin instead of `inset()`. Overshoot the radius to the frame diagonal.

## Sound

A short, filtered air whoosh that peaks on f18 at the fastest sweep, a soft click on the press at −10, and a low thump as the edges hit the frame on f24.
