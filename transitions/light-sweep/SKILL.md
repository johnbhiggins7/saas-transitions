---
name: light-sweep
title: Light & Glow Sweep
category: soft
duration: 0.7s (42f @ 60fps)
energy: calm
description: A soft diagonal band of white light with an indigo falloff sweeps across the lens, the frame flares toward overexposure as it passes, and scene B is revealed under the band's near-opaque core.
---

# Light & Glow Sweep (light leak)

A wide, edgeless band of light crosses the frame on a diagonal. It blows out whatever is under it, the rest of the frame flattens toward overexposure, and the scene behind the band is already the next one. Nothing moves except light, so it reads as a breath between chapters rather than a cut: "new mood, same film".

![contact sheet](contact.png)

## Use it when

- Marking a chapter break in a product film: a recap dashboard into "Chapter 02", or one feature into the next.
- Shifting mood: problem into solution, human footage into UI, a dense screen into an airy title card.
- Opening or closing: a logo sting into the first scene, or the last scene into the end card.
- You want a softer punctuation mark than [kinetic-type-mask](../kinetic-type-mask/SKILL.md) or [geometric-ribbon-wipe](../geometric-ribbon-wipe/SKILL.md). For an even quieter change use [cross-dissolve](../cross-dissolve/SKILL.md) or [soft-blur](../soft-blur/SKILL.md).

Avoid it when scene B continues scene A's space, which needs a camera move such as [ui-deep-zoom](../ui-deep-zoom/SKILL.md) or [infinite-canvas-pan](../infinite-canvas-pan/SKILL.md). Avoid it too when the line itself should reveal something, which is [xray-scanline](../xray-scanline/SKILL.md). Use it once or twice per video at most.

## Anatomy (60fps)

| Beat | Frames | What happens |
| --- | --- | --- |
| Telegraph | 0 → 12 | A lavender light leak (oversized radial, centred on the top-left corner) fades in where the band will enter. It drifts and fades out by f39. |
| Enter | 0 → 10 | The band fades in (0 → 1 over 7.2f) while its core is still off the top-left corner. Scene B is switched on but fully masked. Exposure starts climbing toward `brightness(1.22) contrast(0.9) saturate(0.85)` (`power2.in`). |
| Sweep | 10 → 32 | The core crosses the frame from f9.2 to f32.8 on `power1.inOut` and passes centre at f21, where exposure peaks: ink lifts and greys, and page white drops to ~242, so the white core (255) is the brightest thing in frame. Scene B shows wherever the core has passed and scene A wherever it hasn't. The seam is a ±2.5% feather under a 0.985-opaque core, so you never see it. The copy is revealed f14–22 and the card f20–30, each drifting x −48 → 0 on `expo.out` (from f7 and f17) in the sweep's direction. |
| Exit | 34 → 42 | The band fades over the last 7.2f as the core leaves the bottom-right corner. Scene A is hidden at f42. |
| Land | 42 → 77 | Exposure is back to unfiltered by f51; the forecast card's surface and shadow re-emerge over f26–40 as it falls. The forecast line draws from f42, the confidence pill pops at f54, and the drift settles by f77. |

## Build it

Structure: `#s1` and `#s2` are plain sibling scenes. `#leak` and `#sweep` are overlays above both (`z-index: 10`). `#sweep` is full-frame and never moves. Only its gradient moves, so it can't show an edge. One custom property, `--p`, drives both the band and scene B's mask.

```css
#s2, #sweep { --p: -12; } /* core position along the gradient line, % (0 = top-left corner, 100 = bottom-right) */
#sweep { position: absolute; inset: 0; z-index: 10; opacity: 0; pointer-events: none;
  mask-image: radial-gradient(ellipse 85% 95% at 50% 46%, #000 45%, rgba(0, 0, 0, 0.92) 100%); } /* hotter mid-frame */
#s2 { mask-image: linear-gradient(115deg, #000 calc(var(--p) * 1% - 2.5%), transparent calc(var(--p) * 1% + 2.5%)); }
```

```js
const T = 1.6, D = 0.7, ANGLE = 115; // band leans like "/" and travels top-left -> bottom-right
// [offset from the core in % of the gradient line, colour]. White core; each stop darkens light UI by
// alpha x (255 - R), kept under ~6 so no part of the band is darker than the page.
const HALF = [
  [-27, "rgba(140, 134, 255, 0)"],
  [-20, "rgba(160, 154, 255, 0.04)"],
  [-14, "rgba(214, 212, 255, 0.14)"],
  [-9, "rgba(240, 239, 255, 0.38)"],
  [-5, "rgba(250, 250, 255, 0.75)"],
  [-2.5, "rgba(254, 254, 255, 0.96)"],
  [0, "rgba(255, 255, 255, 0.985)"],
];
const BAND = [...HALF, ...HALF.slice(0, -1).reverse().map(([o, c]) => [-o, c])];
const stop = ([o, c]) => `${c} calc(var(--p) * 1% ${o < 0 ? "-" : "+"} ${Math.abs(o)}%)`;
document.getElementById("sweep").style.backgroundImage = `linear-gradient(${ANGLE}deg, ${BAND.map(stop).join(", ")})`;

tl.fromTo("#leak", { opacity: 0 }, { opacity: 1, duration: 0.2, ease: "power1.in" }, T);
tl.to("#leak", { opacity: 0, x: 240, y: 120, duration: 0.45, ease: "power2.out" }, T + 0.2);

tl.set("#s2", { opacity: 1 }, T); // still fully masked while --p = -12
// One variable for band and seam: the seam can't drift out from under the core.
tl.fromTo(["#sweep", "#s2"], { "--p": -12 }, { "--p": 112, duration: D, ease: "power1.inOut" }, T);
tl.fromTo("#sweep", { opacity: 0 }, { opacity: 1, duration: 0.12, ease: "power1.out" }, T);
tl.to("#sweep", { opacity: 0, duration: 0.12, ease: "power1.in" }, T + D - 0.12);

// Same exposure on both scenes, or the seam shows as a brightness step. contrast(0.9) pulls white to ~242 so the
// white core outshines the page; the reverse tween must name the same three functions.
const LIT = "brightness(1.22) contrast(0.9) saturate(0.85)", UNLIT = "brightness(1) contrast(1) saturate(1)";
tl.fromTo(["#s1", "#s2"], { filter: UNLIT }, { filter: LIT, duration: D * 0.5, ease: "power2.in" }, T);
tl.to(["#s1", "#s2"], { filter: UNLIT, duration: 0.5, ease: "power2.out" }, T + D * 0.5);
tl.set("#s1", { visibility: "hidden" }, T + D);

tl.fromTo(".copy", { x: -48 }, { x: 0, duration: 1.0, ease: "expo.out" }, T + 0.12);
tl.fromTo(".forecast", { x: -48 }, { x: 0, duration: 1.0, ease: "expo.out" }, T + 0.28);
```

Ship both `mask-image` and `-webkit-mask-image`. The full working composition is in [demo.html](demo.html).

## Tuning

- **Duration and curve.** 0.6–0.8s. On `power1.inOut` the core takes about 24f to cross the frame. GSAP's `power2` is cubic, so `power2.inOut` peaks at 3× average speed and crosses in about 18f (power1 takes about 24f), which is a whip, not a sweep. `sine.inOut` is the calmest.
- **Band width.** The falloff reaches ±27% of the gradient line (1% ≈ 22px at 1920×1080 and 115°; the line is |W·sin θ| + |H·cos θ| long). Safe range is ±18–30%. Under about ±15% it reads as a stripe.
- **Core opacity and seam.** The core is white at 0.97–0.99 on light UI. Keep the seam feather (±2–3%) inside the stops where alpha is at least 0.95. Falloff alpha can be anything, as long as alpha × (255 − R) stays under ~6.
- **Exposure.** `brightness` 1.15–1.25, `contrast` 0.88–0.92, `saturate` 0.8–0.9. A brightness of 1.15 alone is invisible on light UI; 1.22 with contrast 0.9 (the demo) is the light-UI equivalent. Brightness alone does little on light UI, because the kit's `#f6f8fb` and white both clip to white. The contrast drop is what gives the band something to outshine: each 0.1 takes ~13 levels off white, so go further and the page reads grey, not lit. On dark UI drop the contrast term; the lift is the main effect.
- **Angle.** 100–130°. Near 90° the band reads as a vertical wipe. A steeper diagonal reads more like light.

## Pitfalls

- **White cards vanish at peak.** At peak exposure the card white and the kit's `#f6f8fb` page clip to the same value, so a card's surface and shadow disappear until exposure falls. Give key cards a darker edge (`--shadow-lg` or a 1px `rgba(10,37,64,0.12)` border) if they must stay readable.
- **A band darker than the page.** Light can't darken a frame. The first build had saturated lavender fringes (`rgba(190,186,255,0.48)`) that read as two parallel bars. The second tinted the core instead (`rgba(228,226,255,0.985)`): with `brightness` clipping the page to pure white, it rendered `#e0dfff`, the darkest large area in frame, and read as a lavender film wiping across. The fix has three parts: a white core, every stop's alpha × (255 − R) under ~6, and `contrast(0.9)` so the page sits below the core. Check it by sampling a pixel: at f18 the core is 255 against a 247 page. Keep the indigo in the falloff and in `#leak`.
- **Ghosting at the seam.** With a ±6% feather under a 0.94 core, scene A's indigo bars showed through scene B's card at f24, and the B headline overlapped "Weekly revenue". Even 6% of a saturated element shows through a 94% veil. The fix was a 0.985 core and a ±2.5% feather.
- **Driving the band and the mask separately.** If you move an oversized band element with `x` and animate the mask on its own, the two drift apart wherever the ease, angle or box size differ. Put the band and the mask on boxes of the same size, use the same angle, and drive both from one `--p`.
- **Hotspot mask too strong.** The radial mask that makes the band hotter mid-frame also thins the core at the frame edges, where the seam still passes. The first value (0.55 at the edge) cut the core to about half its opacity there. At 0.8, scene B's eyebrow and headline still ghosted over scene A's app shell at the left edge (f14). Keep it at 0.9 or more (0.92 here).
- **Leftover glow on scene B.** A 0.08-alpha radial glow on scene B's background (meant as the light's after-glow) banded into a visible arc at 8-bit once the band had gone. It was cut. Use a flat background, or a glow at 0.15 alpha or more.

## Variants

- **Card glint.** The same band at about 40% opacity, with no mask and no scene change, across one hero card or a logo. Use 0.5s to make a static frame feel lit.
- **Dark UI.** A near-opaque white core flashes on dark surfaces, so use a white core with `mix-blend-mode: screen` at about 0.7 and let the exposure lift do more. A 0.7 core can't hide the seam (see Ghosting), so widen the `#s2` feather to about ±10%. The handoff then becomes a short dissolve under the light instead of a ghosted edge.
- **Brand or warm leak.** Swap the tint for the brand colour, or for amber when scene A is human footage. Keep the core white and the tint in the falloff and the leak, under the alpha × (255 − R) cap.
- **Reverse sweep.** Set both `ANGLE` and the `#s2` mask angle to 295°, and keep the same `--p` range. The band then travels bottom-right → top-left, so the light can return at the end of a chapter.

## Sound

A soft airy shimmer swell (reverse-cymbal air, no transient) peaking on f20–22 as the core crosses frame centre, tailing off under scene B's landing.
