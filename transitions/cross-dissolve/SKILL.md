---
name: cross-dissolve
title: Cross-Dissolve
category: soft
duration: 0.8s (24f @ 30fps)
energy: calm
description: Scene B fades in over a fully opaque scene A while the two drift 2% in opposite scale, so the frame passes through a double exposure with no luminance dip and settles on B.
---

# Cross-Dissolve (over-fade)

Nothing moves across the frame. Scene B's opacity rises over scene A, and for a dozen frames the viewer sees both at once, then only B. It says "this continues": the person in A and the product in B are the same story. It's the softest way from a human moment (a customer quote, a talking head) into the interface.

![contact sheet](contact.png)

## Use it when

- Going from a testimonial, founder clip or live-action shot to the product it talks about. Here, a VP Finance's quote turns into the month-end close screen she's describing.
- The mood changes but the topic doesn't: warm human backdrop to cool product UI, or product to end card in an outro.
- You want more character in the blend: [soft-blur](../soft-blur/SKILL.md) adds defocus and [light-sweep](../light-sweep/SKILL.md) hides the swap under a band of light. If the two scenes share a shape, cut on it with [graphic-match-cut](../graphic-match-cut/SKILL.md).

Avoid it between two states of the same UI. A dissolve between two dashboards looks like a double render. Use [component-reflow](../component-reflow/SKILL.md) or [shared-element](../shared-element/SKILL.md). It's also too slow for montages, where [speed-match-cut](../speed-match-cut/SKILL.md) fits better.

## Anatomy (30fps)

| Beat | Frames | What happens |
| --- | --- | --- |
| Telegraph | −17 → −5 | A highlight sweeps under "nine days to two." (`scaleX` 0 → 1, `power3.out`). The eye now rests where B's headline number will appear. |
| Blend in | 0 → 8 | `#s2` opacity rises on `sine.inOut`. Almost nothing shows for the first 4f (mean luma moves 0.45 of the 8.4 total). A's camera starts drifting 1 → 1.02. |
| Double exposure | 8 → 16 | Both scenes are fully readable at once. At frame 12 it's an exact 50/50 mix, and B's "2.1 days" lands above the start of A's first quote line, up and left of the highlighted phrase. B's camera settles 1.02 → 1 against A's growth. |
| Resolve | 16 → 24 | A's ghost thins out, last of all in its darkest strokes (the quote text). At 24, `#s1` is set to `visibility: hidden` under a fully opaque B. |
| Hold | 24 → 72 | B holds for 1.6s. It arrived complete: in a dissolve, the fade is the entrance. |

## Build it

Structure: `#s1` and `#s2` are sibling `.scene`s, with `#s2` stacked on top and an opaque background. Each wraps its content in a `.cam` that carries the scale drift. Opacity goes on the scene div only.

```js
const T = 1.6, D = 0.8;  // 24f
const DRIFT = 1.02;      // opposite scale drift: A grows into it, B settles out of it

tl.fromTo("#hl-mark", { scaleX: 0, transformOrigin: "0% 50%" }, { scaleX: 1, duration: 0.4, ease: "power3.out" }, T - 0.55);

// Over-fade: only B's opacity moves. A stays at 1 underneath, so every frame is
// a*B + (1-a)*A with weights summing to 1.
tl.fromTo("#s2", { opacity: 0 }, { opacity: 1, duration: D, ease: "sine.inOut" }, T);
tl.fromTo("#s1 .cam", { scale: 1 }, { scale: DRIFT, duration: D, ease: "sine.inOut" }, T);
tl.fromTo("#s2 .cam", { scale: DRIFT }, { scale: 1, duration: D, ease: "sine.inOut" }, T);
tl.set("#s1", { visibility: "hidden" }, T + D); // fully covered now; stop painting it
```

The full working composition is in [demo.html](demo.html).

## Tuning

- **Duration.** 0.6–1.0s (18–30f). `sine.inOut` spends about 4f at each end with under 5% change, so 24f feels like a 16f blend. Under 0.5s it reads as a smeared cut. Over 1.2s both scenes stay half-legible too long. Outros can stretch to 1.5s.
- **Curve.** Use `sine.inOut` or `power1.inOut`. This is the one place the "ease hard" house rule doesn't apply. On opacity, `expo.out` or `power3+` brings B in within 3–4f, which reads as a cut, not a dissolve.
- **Drift (`DRIFT`).** 1.01–1.03. At 1, it's a flat, pure dissolve, which is fine. Above 1.04 the scale move takes over and it reads as a zoom transition.
- **Focal handoff.** Put B's focal element within about 100px of A's (here the quote line starts 96px below the top of "2.1" and 32px to its left; the highlight itself starts ~135px further right, so align the telegraph with B's focal point when you can). Then the eye never has to search during the double exposure.

## Pitfalls

- **Fading A out as well.** If A fades to 0 while B fades in, a quarter of whatever sits behind both scenes shows through at the midpoint. In this demo, the symmetric version's midpoint washed toward the page background: mean luma was 225.8, against 223.5 for the over-fade (A 219.4, B 227.8, exact halfway 223.6), and A's ghost was half as strong. Over a dark backdrop, the same math gives the familiar dip to black.
- **Transparent scene B.** The over-fade only covers A if B is opaque everywhere. A B without a background, or with gaps, leaves A visible at 100%, and hiding A at the end then pops.
- **Text on text.** Large type in A that lands on large type in B turns into mush at frame 12. In the demo, A's third quote line crosses B's "Close checklist" heading, A's attribution lies on B's table rows, and B's delta pill touches A's first line; the heading patch is the hardest to read. Offset the headlines, as with "2.1 days" sitting above the quote line here, rather than stacking them.
- **Too-similar scenes.** Two light layouts with the same backdrop dissolve into something that looks like a glitch. Give each scene its own backdrop: here A is warm (peach to lavender) and B is the cool `--bg` with dots.
- **Animating B's content during the blend.** Staggered entrances inside B make the midpoint frames read as a build, not a dissolve. B arrives complete. Start secondary motion after frame 24.

## Variants

- **Dip to color.** Fade a full-frame `#dip` layer to 1 over about 8f (`sine.in`) and hold 2–4f. Swap the scenes under it with `tl.set`, then fade it to 0 over about 10f (`sine.out`). Dip to white for a breath on light products, or to `--ink` or the brand indigo for a chapter break. It reads as a pause, not a continuation.
- **Long outro dissolve.** 1.2–1.5s from the product to the logo card, with `DRIFT` at 1.01. Time the midpoint to the music's last downbeat.
- **Dissolve inside a frame.** Dissolve only a device's screen content, such as a customer clip into the app, while the laptop stays put. Then continue with [device-to-canvas-wrap](../device-to-canvas-wrap/SKILL.md).

## Sound

A soft pad or reverse-shimmer swell peaking at frame 12 (the 50/50 frame). It often works better with no foley at all, letting a phrase change in the music carry it.
