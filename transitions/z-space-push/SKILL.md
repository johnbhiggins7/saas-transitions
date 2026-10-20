---
name: z-space-push
title: Z-Space Push
category: camera-spatial
duration: 0.8s (24f @ 30fps)
energy: medium-high
description: UI layers sit at different depths; the camera flies straight through the foreground cards, which blur and part past the frame edges, and lands sharp on the panel that was deep behind them.
---

# Z-Space Push (depth fly-through)

Scene A is a stack of UI planes at different `translateZ`: sharp modals and notifications up front, softer cards behind them, and the destination panel small and out of focus at the back. The camera pushes forward. Each plane scales up hyperbolically, drifts outward past the frame edges and defocuses as it nears the lens, and the back plane grows into a sharp, full-frame scene B. It says "behind this surface is the thing that explains it."

![contact sheet](contact.png)

## Use it when

- Going from a surface signal to what's underneath it: an alert or notification → the analytics behind it, a dashboard → its settings or data layer.
- Scene A can honestly be shown as layered UI (floating cards over a product), so the depth is visible before the move.
- Showing that a product has layers (UI → workflow → data) in one continuous move. [rack-focus](../rack-focus/SKILL.md) gives you the same stack without moving the camera, and [isometric-stack-explosion](../isometric-stack-explosion/SKILL.md) lays the layers side by side.

Avoid it when scene A is one flat full-screen UI with nothing in front to fly through. Use [ui-deep-zoom](../ui-deep-zoom/SKILL.md) to dive into one element, or [infinite-canvas-pan](../infinite-canvas-pan/SKILL.md) when the scenes sit side by side.

## Anatomy (30fps)

| Beat | Frames | What happens |
| --- | --- | --- |
| Telegraph | −10 → 4 | A ring pulses off "Open analytics" (from −10.5), then the button presses (scale 0.96, 0.12s yoyo from −3.6). It bottoms out on frame 0, so the click becomes the push, and releases by f3.6 while the planes barely move. |
| Push off | 0 → 7 | Every plane gets `z += 1800` on one `power3.inOut`, which is one camera. It leaves rest gently: foreground 1 → 1.17×. |
| Foreground pass | 7 → 13 | Foreground 1.17× → 4× (f12), parting left, right and down. Blur 2 → 36px (proportional to scale − 1). It's mostly off-frame at f12 and gone at f13, with `visibility: hidden` set at f12.6 (6.7×, z = 0.85 × perspective). |
| Mid pass | 10 → 14 | Mid cards 0.81× → 1.66×, hugging the destination's edges and then leaving them. They hold their 4.8px rest blur up to about 1.4×, then soften (about 8px at f14) as they exit, so they never snap sharp. The plane stops at 6× (z = 1000, short of the hide depth) and is hidden at f24. |
| Arrival | 12 → 24 | Destination 0.57× → 1×, blur 5.1 → 0px, so it's sharp just as it fills the frame. f18 → 24 covers only 0.91 → 1×: the settle. |
| Land | 19 → 40 | Scene B's annotation arrives on the settle: guide line (`expo.out`), spike dot (`back.out(2)`), tooltip (`expo.out`). |

## Build it

Structure: `#s1` › three `.layer` wrappers in back-to-front DOM order. Each is full-frame and unscaled, with `perspective: 1200px`, `overflow: hidden`, and the `filter`. Inside each is a `.plane` that carries `translateZ`. The wrappers share one perspective-origin, so they composite as one space.

```js
const T = 1.6, D = 0.8;
const P = 1200;                  // perspective (px) on every .layer
const PUSH = 1800;               // camera travel = depth of the destination plane (rest scale P/(P+PUSH) = 0.4)
const LAYERS = [{ el: "#deep", z: -1800 }, { el: "#mid", z: -800 }, { el: "#fg", z: 0 }];
const HIDE_Z = 0.85 * P;         // hide a plane (~7x, off-frame) before it reaches the lens at z = P
const APERTURE = 12, MAX_BLUR = 36;

const move = gsap.parseEase("power3.inOut");
const zAt = (z0, p) => z0 + PUSH * move(p);
// Screen-space defocus ∝ |projected scale − 1|: sharp at z = 0, soft behind, very soft up close.
const defocus = (z) => (z >= HIDE_Z ? MAX_BLUR : Math.min(MAX_BLUR, APERTURE * Math.abs(P / (P - z) - 1)));
// Planes that fly past never get sharper than at rest (see Pitfalls).
const blurAt = (z0, p) => (z0 + PUSH > 0 ? Math.max(defocus(z0), defocus(zAt(z0, p))) : defocus(zAt(z0, p)));
const pAtTravel = (dz) => { let lo = 0, hi = 1; for (let i = 0; i < 24; i++) { const m = (lo + hi) / 2; PUSH * move(m) < dz ? (lo = m) : (hi = m); } return hi; };

tl.fromTo("#f-btn-ring", { opacity: 0.9, scale: 1 }, { opacity: 0, scale: 1.25, duration: 0.5, ease: "power2.out" }, T - 0.35);
tl.to("#f-btn", { scale: 0.96, duration: 0.12, ease: "power2.out", yoyo: true, repeat: 1 }, T - 0.12); // bottoms out at T

LAYERS.forEach(({ el, z }) => {
  tl.fromTo(`${el} .plane`, { z }, { z: z + PUSH, duration: D, ease: move }, T); // same dz + same ease = one camera
  // Blur is a function of depth, not of time: a custom ease maps progress → blurAt(p) between the endpoints.
  const b0 = blurAt(z, 0), b1 = blurAt(z, 1);
  tl.fromTo(el, { filter: `blur(${b0}px)` }, { filter: `blur(${b1}px)`, duration: D, ease: (p) => (blurAt(z, p) - b0) / (b1 - b0) }, T);
  // Hide every plane that passes z = 0: at HIDE_Z, or when the push ends if it stops short (mid, z = 1000).
  if (z + PUSH > 0) tl.set(el, { visibility: "hidden" }, T + D * pAtTravel(Math.min(HIDE_Z, z + PUSH) - z));
});

const tLand = T + D * 0.78;
tl.fromTo("#spike-guide", { opacity: 0, scaleY: 0, transformOrigin: "50% 100%" }, { opacity: 1, scaleY: 1, duration: 0.5, ease: "expo.out" }, tLand);
tl.fromTo("#spike-dot", { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration: 0.45, ease: "back.out(2)" }, tLand + 0.06);
tl.fromTo("#spike-tip", { opacity: 0, x: 24, scale: 0.94, transformOrigin: "100% 50%" }, { opacity: 1, x: 0, scale: 1, duration: 0.6, ease: "expo.out" }, tLand + 0.12);
```

The full working composition is in [demo.html](demo.html).

## Tuning

- **Duration.** 0.7–0.9s (21–27f). Under 0.6s each plane's pass shrinks to ~3 frames of smear. Over 0.9s the pass floats.
- **Depth.** The destination's rest scale is `P / (P + PUSH)`. Keep it in 0.35–0.45. Lower reads deeper, but the destination becomes an unreadable smudge at rest and the foreground clears earlier in the move.
- **Spacing.** Put the mid plane at a rest scale of about 0.6. Give mid cards inner edges that hug the destination's rest box, so they exit around 1.6× (f14). The planes then peel off in order: foreground (f12), mid (f14), land (f24).
- **Aperture.** 8–14. The destination's rest blur is `APERTURE × (1 − s)` (7.2px here). Above ~8px it stops reading as a dashboard.
- **Ease.** Use `power3.inOut`. `power2.inOut` spreads the pass over more frames and feels calmer. `expo.inOut` crams the foreground pass into ~3 frames.

## Pitfalls

- **Blur on the 3D plane.** A filter is applied before the transform, so `blur()` on a `translateZ` plane is multiplied by its projected scale: 6px reads as 2.4px at 0.4×, and as 36px at 6×. A filter on a shared `preserve-3d` world flattens the world. Give each plane its own unscaled wrapper that owns both `perspective` and `filter`.
- **The mid layer snapped into focus.** With a fixed focal plane, which is what you get in AE when the focus distance rides with the camera, every plane is perfectly sharp as it crosses z = 0. In the first build that happened to the mid cards at f12, crisp at the frame edges, and it pulled the eye off the destination. Clamp passing planes to their rest blur (the `Math.max` in `blurAt`).
- **Planes reaching the lens.** As z → P the scale goes to infinity, and past P the plane is behind the lens. Hide each passing plane at 0.85P, when it's already off-frame, or at the end of the push if it never gets that close. Compute that time from the ease (`pAtTravel`) instead of eyeballing a frame.
- **Cards on the camera axis.** A centered foreground card can't drift out. It fills the frame with a 36px white wash for several frames. Keep foreground inner edges ≥300px off center so the cards part like curtains, with the destination visible in the gap.
- **Floor edges.** A full-frame background on the deep plane shows its edges at 0.4×. Oversize it by 1/s (5920×3280 here). The dot grid then reads as density and sharpens as you arrive.
- **Blur as a tween.** Blur follows 1/(P − z) through the ease, not time, so a plain from → to blur tween is wrong at every frame in between. Derive it inside the tween with a custom ease, not with an `onUpdate`, so every seek renders the same frame.

## Variants

- **Pull back.** Reverse it: the destination recedes and the cards fly in from behind the camera to settle at their depths. Pairs with [contextual-pullback](../contextual-pullback/SKILL.md).
- **Off-axis landing.** Add the same `x`/`y` to every plane along with `z`. Perspective turns it into parallax, and the camera lands on a panel that isn't centered.
- **Deeper stack.** Use 4–5 planes (toast, modal, toolbar, panel, data) for an architecture dive. Keep ≥600px of z between planes, so each plane's pass gets its own frames.

## Sound

A deep air whoosh peaking at f12, as the foreground passes the lens, plus a soft low thump on the f24 settle and a tick when the tooltip lands.
