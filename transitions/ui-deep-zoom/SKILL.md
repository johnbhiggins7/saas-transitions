---
name: ui-deep-zoom
title: UI Deep Zoom
category: camera-spatial
duration: 0.6s (18f @ 30fps)
energy: medium-high
description: The camera rushes into one small UI element (button, node, toggle) until its fill covers the frame and becomes the background of the next scene.
---

# UI Deep Zoom (macro-to-micro portal)

The camera scales into a tiny element of scene A, such as a button, chart node, avatar or toggle, until that element fills the viewport. Its fill color *is* scene B's background, so scene B appears to live inside the element. It says "let's go deeper into this."

![contact sheet](contact.png)

## Use it when

- Drilling from an overview into one feature: dashboard → report, list → detail, a setting → its panel.
- The element you zoom into is the thing scene B is about. Zooming into a random spot reads as a gimmick.
- Pair with [contextual-pullback](../contextual-pullback/SKILL.md) for the return trip.

Avoid it when the target has no solid fill (photo, gradient text, thin outline). The cover frame would be noisy. Use [container-mask-expand](../container-mask-expand/SKILL.md) for a framed card instead.

## Anatomy (30fps)

| Beat | Frames | What happens |
| --- | --- | --- |
| Telegraph | −14 → 0 | A ring pulses off the target, then the target does a 4f press (scale 0.96 yoyo). The eye lands before the camera moves. |
| Rush | 0 → 18 | Camera layer scales 1 → ~30× around the target center in **log space**, accelerating (`power2.in` on the exponent). At the same time it translates the target to frame center (`power2.inOut`). The label fades out over the first 6f. Screen-space blur ramps 0 → 4px over the last 8f. |
| Cover | ~17 | The target's fill covers the frame. Scene B, with the same background color, switches on underneath the remaining zoom. |
| Land | 17 → 41 | Scene B content arrives still moving toward camera: the headline scales 1.4 → 1 and the panel rises, both on `expo.out`. Fast motion in the rush becomes long deceleration on landing. |

## Build it

Structure: `#s1` (scene, unscaled, carries `filter`) › `.cam` (camera layer, carries `transform`) › content. Scene B's background must equal the target's fill exactly.

```js
const T = 1.5, D = 0.6;
const TARGET = { x: 1575, y: 405, w: 168, h: 48 };       // target box in scene px; hard-code it, don't measure at load
const cx = TARGET.x + TARGET.w / 2, cy = TARGET.y + TARGET.h / 2;
const COVER = Math.max(1920 / TARGET.w, 1080 / TARGET.h); // scale where the target fills the frame
const S = COVER * 1.35;                                    // overshoot so rounded corners leave frame

const accel = gsap.parseEase("power2.in");
const logZoom = (p) => (Math.pow(S, accel(p)) - 1) / (S - 1); // scale = S^accel(p)
const tCover = T + D * Math.sqrt(Math.log(COVER) / Math.log(S));

tl.fromTo("#target-ring", { opacity: 0.9, scale: 1 }, { opacity: 0, scale: 1.25, duration: 0.5, ease: "power2.out" }, T - 0.45);
tl.to("#target", { scale: 0.96, duration: 0.12, ease: "power2.out", yoyo: true, repeat: 1 }, T - 0.24);

tl.set("#s1 .cam", { transformOrigin: `${cx}px ${cy}px` }, 0);
tl.to("#s1 .cam", { scale: S, duration: D, ease: logZoom }, T);
tl.to("#s1 .cam", { x: 960 - cx, y: 540 - cy, duration: D, ease: "power2.inOut" }, T);
tl.to("#target-label", { opacity: 0, duration: D * 0.35, ease: "power1.in" }, T);
tl.to("#s1", { filter: "blur(4px)", duration: D * 0.45, ease: "power1.in" }, T + D * 0.55);

tl.set("#s2", { opacity: 1 }, tCover);          // #s2 background === target fill
tl.set("#s1", { visibility: "hidden" }, T + D);
tl.fromTo("#s2 .copy", { scale: 1.4, opacity: 0, transformOrigin: "0% 0%" }, { scale: 1, opacity: 1, duration: 0.7, ease: "expo.out" }, tCover);
tl.fromTo("#s2 .panel", { y: 640, scale: 1.08 }, { y: 0, scale: 1, duration: 0.8, ease: "expo.out" }, tCover + 0.06);
```

The full working composition is in [demo.html](demo.html).

## Tuning

- **Duration.** 0.5–0.7s. Under 0.45s the rush is unreadable; over 0.8s it drags.
- **Overshoot (`S = COVER × 1.2–1.5`).** Raise it for large corner radii. Check that the cover frame has no visible corners.
- **Curve.** `power2.in` on the exponent feels like falling in. Use `power1.in` for a calmer glide, or `power3.in` for a slam.
- **Target size.** The smaller the target, the bigger `S` and the faster the rush. A 40px target needs about 30–50×, which is fine.

## Pitfalls

- **Linear scale tween.** `scale: 1 → 30` on any standard ease spends most of its time near 1× and then lurches. Always tween in log space.
- **Blur on the scaled layer.** CSS filters apply before the transform, so `blur(6px)` at 30× becomes 180px of mush. Put the filter on an unscaled parent.
- **Measuring at load.** `getBoundingClientRect` at script time picks up entrance offsets and pre-font layout. Hard-code the target box from CSS.
- **Mismatched background.** If scene B's background differs from the target fill by even a shade, the handoff flashes.
- **Text in the target.** Fade labels and icons out early, or they smear across the frame at 30×.

## Variants

- **Period portal.** Zoom into the dot of an "i" or a full stop in a headline. Same math, with the target being a ~16px circle.
- **Node dive.** Zoom into a chart node or graph vertex. Scene B is that data point's detail.
- **Light target.** Zoom into a white card. Scene B's background is `--surface`, so the result stays light.

## Sound

Rising air whoosh timed so its peak lands on the cover frame, plus a soft low thump on landing.
