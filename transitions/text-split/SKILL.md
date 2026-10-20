---
name: text-split
title: Text Split Reveal
category: masking
duration: 0.9s (27f @ 30fps: 12f slam + 15f split)
energy: high
description: A bold headline slams onto scene A, then the whole frame is cut along the type's midline and the two halves slide apart vertically, revealing the next scene in the widening gap.
---

# Text Split Reveal (type slice)

A headline slams onto the outgoing scene. Then the frame is cut through the middle of the letters, and the top and bottom halves (type and scene A together) slide apart. The next scene appears in the gap. The copy names what comes next, and cutting through it is the cut, so the viewer reads the line and is shown its subject.

![contact sheet](contact.png)

## Use it when

- A named feature or claim connects the problem screen to the product: "Meet Autopilot", "Now with AI", "Ship it Friday".
- A product tour needs a chapter break and the copy *is* the chapter title.
- Scene B has two rows with a gutter at frame centre, such as a workflow above its run history, or a chart above a table. The gap opens in the gutter, then uncovers both rows at once.
- For type that acts as a window onto scene B, use [kinetic-type-mask](../kinetic-type-mask/SKILL.md). For a copy-free graphic break, use [geometric-ribbon-wipe](../geometric-ribbon-wipe/SKILL.md).

Avoid it when the copy runs past about three words: a sentence can't be read in the ~12f before the cut. Also avoid it when there is no copy worth saying. A split through nothing is just a barn-door wipe, so use [container-mask-expand](../container-mask-expand/SKILL.md) or [cross-dissolve](../cross-dissolve/SKILL.md). Use it once per video.

## Anatomy (30fps)

Frame 0 = split start (T = 1.6s); the transition window opens at the slam, f−12 (1.2s). Gap heights are measured from the render.

| Beat | Frames | What happens |
| --- | --- | --- |
| Slam | −12 → −8 | The headline (220px, weight 800) scales 1.15 → 0.985 on `power3.in`, so it accelerates into the screen. It is fully opaque by −10. A `--bg` veil over scene A rises 0 → 0.72 on the same 4f, so the type gets a calm backdrop and scene A stays faintly visible. |
| Settle | −8 → −6 | Scale 0.985 → 1 on `power2.out`. This 2f undershoot is the impact. |
| Hold | −6 → 0 | The line is readable: 6f still, plus the slow start of the split. |
| Crack | 0 → 5 | Scene B switches on under the halves at f0. The halves start parting on `power4.inOut`: a 4px hairline at f3, a 24px band at f4, 77px at f5. Scene B's gutter keeps that band solid indigo, so each letter is visibly sliced in two by a colour stripe. |
| Rip | 5 → 10 | The gap grows 196 (f6) → 424 (f7) → 773 (f8) → 1001 (f9) px, uncovering the node row above and the runs card below. At peak each half moves about 175px per frame. Both halves leave the frame at f10, still moving. `#s1` is hidden at f15. |
| Land | 4 → 34 | Scene B settles 1.1 → 1 (`expo.out`, from f4), so it reads as sitting behind the halves. Its connectors draw on at f9 and f13. |

## Build it

Structure: `#s1` (transparent, above `#s2`) › `.half.top` (y 0–540) and `.half.bot` (y 540–1080), both `overflow: hidden` › one full-frame `.stage` each (scene A UI + `.veil` + `.headline`). The bottom copy's `.stage` sits at `top: -540px`, so each half shows its side of the same frame. Leave scene B's band around y 540 empty (the demo's gutter is 498–590).

```css
.half { position: absolute; left: 0; width: 1920px; height: 540px; overflow: hidden; }
.half.top { top: 0; }  .half.bot { top: 540px; }  .half.bot .stage { top: -540px; }
/* Inter 220px / line-height 1: baseline ~190px down, so top 420 puts the x-height across y = 540 */
.headline { position: absolute; top: 420px; width: 1920px; font-size: 220px; line-height: 1; font-weight: 800; text-align: center; }
```

```js
// Scene A is written once; the bottom half gets a clone. Clone BEFORE creating any tween:
// GSAP resolves selectors when a tween is created, so a later clone would never animate.
const stageTop = document.querySelector("#s1 .half.top .stage");
document.querySelector("#s1 .half.bot").appendChild(stageTop.cloneNode(true));

const T = 1.6, D = 0.5, f = 1 / 30;
const SPLIT_Y = 540;          // cut line; the .half heights and the headline's top are built around it
const TRAVEL = SPLIT_Y + 60;  // overshoot so the halves exit at f10 and the ease's slow tail stays off screen
const TS = T - 12 * f;        // slam starts 12f before the split

tl.fromTo("#s1 .headline", { scale: 1.15 }, { scale: 0.985, duration: 4 * f, ease: "power3.in" }, TS);
tl.fromTo("#s1 .headline", { opacity: 0 }, { opacity: 1, duration: 2 * f, ease: "power1.out" }, TS);
tl.to("#s1 .headline", { scale: 1, duration: 2 * f, ease: "power2.out" }, TS + 4 * f);
tl.fromTo("#s1 .veil", { opacity: 0 }, { opacity: 0.72, duration: 4 * f, ease: "power2.out" }, TS);

tl.set("#s2", { opacity: 1 }, T);
tl.to("#s1 .half.top", { y: -TRAVEL, duration: D, ease: "power4.inOut" }, T);
tl.to("#s1 .half.bot", { y: TRAVEL, duration: D, ease: "power4.inOut" }, T);
tl.set("#s1", { visibility: "hidden" }, T + D);

tl.fromTo("#s2 .cam", { scale: 1.1 }, { scale: 1, duration: 1.0, ease: "expo.out" }, T + 4 * f);
```

The full working composition is in [demo.html](demo.html).

## Tuning

- **Duration.** 0.4–0.6s for the split (`D`). Because of the travel overshoot, the halves clear the frame at about 2/3 of `D`. Under 0.35s the crack lasts only a frame and the sliced letters never register. Over 0.7s the slam's energy drains out.
- **Ease.** `power4.inOut` gives the crack-then-rip. `power3.inOut` spreads the opening over more frames, which is calmer and easier to read. `expo.inOut` is the violent version.
- **Travel.** `SPLIT_Y + 40–100`. More travel exits the halves sooner and faster.
- **Hold.** −6 → 0 suits two words. Add about 3f per extra word, and don't go past 12f or the slam goes stale.
- **Veil.** 0.6–0.85. Lower keeps more of scene A visibly riding the halves. Higher makes the type cleaner over a busy UI.

## Pitfalls

- **Content on the cut line.** The first build centred scene B's white node cards on y 540. In the 24–77px band at f4–f5 they read as a strip of UI laid over the headline: same light value as the halves, same ink text as the letters. Keep scene B's band clear for the width of the f5 gap, measured at its starting scale (here 1.1×), so the crack is a clean colour stripe.
- **Cut in the wrong place.** If the cut misses the letters (below the baseline, or through the line box's empty top), every glyph stays on one side and the move reads as a plain barn-door wipe. Put the cut near the middle of the x-height and derive the headline's `top` from the font's baseline.
- **Travel of exactly half the frame.** The halves then spend the last ~4f of `power4.inOut` crawling as slivers along the frame edges. Overshoot the travel so they exit while still fast.
- **Fades on what the gap reveals.** Fading scene B's header in on the halves' schedule left it half-transparent and washed out, and a y-rise fought the 1.1 → 1 settle. The parting halves are the entrance; a scale settle on the whole scene is enough.
- **Clone order and ids.** Tweens built before the clone hit only the top copy, so the halves tear apart mid-slam. Ids inside `.stage` get duplicated. Use classes.
- **Gap colour = type colour.** If scene B's background matches the headline ink, the sliced letter edges merge into the gap and look like they're melting. Use a contrasting scene B (the demo uses ink type over an indigo gap).

## Variants

- **Diagonal split.** Make both halves full-frame and clip them with `clip-path: polygon(...)` along a slanted line through the type (for example 0 56% → 100% 44%). Move each half along the cut's normal (x and y), not straight up and down.
- **Doors.** Cut vertically between two words and push the halves left and right. Good for short, centered lines like "Before | After".
- **Two-line slice.** Use two cuts for a two-line headline. The middle band (the second line's top half and the first line's bottom half) drops out first, then the outer halves part.

## Sound

A hard, dry impact on f−8 (the slam's undershoot), then a short tearing air whoosh peaking around f7, as the gap rips open.
