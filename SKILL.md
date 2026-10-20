---
name: saas-transitions
description: >
  Library of SaaS and product-video scene transitions for HyperFrames, one subskill per transition, each with
  timing anatomy, copy-paste GSAP code, a working demo composition and a rendered preview. Use when choosing,
  storyboarding, building or reviewing a transition between scenes of a product, launch, feature or explainer
  video: UI deep zoom, contextual pullback, canvas pan, whip pan, z-space push, rack focus, 3D card flip,
  isometric stack, device wrap, component morph, icon-to-UI morph, prompt/code-to-UI render, shared element,
  layout reflow, bento cascade, cursor-click expand, toggle/theme shift, container mask, rail wipe, kinetic
  type mask, scanline/x-ray reveal, split-screen takeover, graphic or speed match cut, path leading, parallax
  push, dissolve, blur or light sweep. Complements /hyperframes-animation (generic CSS/shader transitions);
  this skill is the SaaS-specific choreography.
---

# SaaS Transitions

Each transition lives in `transitions/<slug>/`:

| File | What it is |
| --- | --- |
| `SKILL.md` | The subskill: when to use it, frame-by-frame anatomy, GSAP code, tuning, pitfalls, variants, sound pairing |
| `demo.html` | A working two-scene HyperFrames composition built on the shared light UI kit |
| `preview.mp4` | The rendered demo (1920×1080, 30fps) |
| `contact.png` | 12 frames across the transition window. Read this to *see* the transition without playing video. |

**To use one:** pick it from the matrix below, open its `SKILL.md`, and look at `contact.png`. Then adapt the code from `demo.html` to your scenes. Read `/hyperframes-core` first if you haven't written a composition before.

## Choose

Pick **2–3 signature transitions per video** and let them do 80% of the work (usually a deep zoom, a shared element and a morph). Save wipes and type masks for chapter breaks. A different transition at every cut reads as a template pack.

| Need | Reach for |
| --- | --- |
| Drill from overview into a detail / return to context | ui-deep-zoom · contextual-pullback |
| Show ecosystem scale, connect many surfaces | infinite-canvas-pan · whip-pan · parallax-push |
| Premium depth, architecture layers, front vs back | z-space-push · rack-focus · card-flip-3d · perspective-tilt · isometric-stack-explosion |
| Put the product on hardware, or dive off it | device-to-canvas-wrap |
| Turn a concept or value prop into real UI | icon-to-scene-morph · ui-component-morph · prompt-to-ui-render · liquid-blob-morph |
| Follow one object (user, ticket, card) through a flow | shared-element |
| Show flexibility, responsive or alternate views | component-reflow · bento-cascade |
| Teach the UX while changing scenes | cursor-click-expand · toggle-theme-shift · dropdown-accordion-wipe |
| Spotlight one panel of a busy layout | container-mask-expand |
| Chapter breaks, copy-led moments | kinetic-type-mask · text-split · geometric-ribbon-wipe · border-rail-wipe |
| Reveal what's underneath (data, wireframe, AI) | xray-scanline |
| Old way vs new way | split-screen-takeover |
| High-energy montage, invisible cuts | graphic-match-cut · speed-match-cut · path-stroke-leading |
| Mood shifts, human → UI, open/close | cross-dissolve · soft-blur · light-sweep |

### Four techniques that get confused

1. **Match cut.** Switches scenes *instantly* (one frame) by aligning position, shape or speed.
2. **Morph.** Continuously *deforms* one object's shape until it becomes another object.
3. **Shared element.** Keeps the *same object* intact on screen while the layout around it changes.
4. **Deep zoom.** Scales *inside* an object until it becomes the next scene's environment.

## House rules for every transition

- **Ease hard.** Never linear. Use a fast-in, long exponential settle (`expo.out`, `power3/4`). UI cards may overshoot 2–5% (`back.out(1.2)`).
- **Keep it tight.** 10–20 frames at 30fps (0.33–0.67s) for the move itself. Camera rushes and morphs can run to 24f. Anything longer stalls the narrative.
- **The transition is the exit.** Don't fade scene A out before the move. Outgoing and incoming animate in the same window (`/hyperframes-animation` → `transitions/overview.md`).
- **Telegraph, then move.** Draw the eye to where the motion starts, a few frames before it starts.
- **Seek-safe.** Use one paused GSAP timeline with `tl.set` for state flips, never `onComplete`, and no `Math.random`.
- **Sound.** Pair camera moves with air whooshes, morphs with soft synth swells and UI triggers with crisp clicks. Resolve them through `/media-use`. Each subskill names its pairing.

## Index

Approved transitions only. A transition appears here once its render has been reviewed and committed.

<!-- index:start -->
| Transition | Category | Duration | Summary |
| --- | --- | --- | --- |
| [UI Deep Zoom](transitions/ui-deep-zoom/SKILL.md) | Camera & Spatial | 0.6s | The camera rushes into one small UI element until its fill becomes the next scene's background |
| [Contextual Pullback](transitions/contextual-pullback/SKILL.md) | Camera & Spatial | 0.8s | Snaps back from a macro UI action and tilts to 2.5D, revealing the surfaces it updated |
| [Infinite Canvas Pan](transitions/infinite-canvas-pan/SKILL.md) | Camera & Spatial | 1s | Glides across one dot-grid canvas between node clusters, with a slight mid-pan zoom-out |
| [Whip Pan](transitions/whip-pan/SKILL.md) | Camera & Spatial | 0.43s | Whips to peak speed under horizontal motion blur, with a hard cut on the fastest frame |
| [Z-Space Push](transitions/z-space-push/SKILL.md) | Camera & Spatial | 0.8s | Flies through blurred foreground layers to land sharp on a panel deep behind them |
| [Rack Focus](transitions/rack-focus/SKILL.md) | Camera & Spatial | 0.7s | Focus pulls from a foreground card to the dashboard behind it, with almost no movement |
| [3D Card Flip](transitions/card-flip-3d/SKILL.md) | Camera & Spatial | 0.7s | A UI card flips 180° to show the API request or config behind it |
| [Perspective Tilt & Extrusion](transitions/perspective-tilt/SKILL.md) | Camera & Spatial | 0.8s | The window tilts back as an extruded slab while the next swings in and flattens |
| [Isometric Stack Explosion](transitions/isometric-stack-explosion/SKILL.md) | Camera & Spatial | 1.6s | Tips into isometric, splits into labelled layers, then flattens one into the next scene |
| [Device-to-Canvas Wrap](transitions/device-to-canvas-wrap/SKILL.md) | Camera & Spatial | 0.8s | Full-bleed UI pulls back into a 3D laptop screen as the device assembles around it |
| [UI-to-UI Component Morph](transitions/ui-component-morph/SKILL.md) | Morphing | 0.65s | One container stretches and re-rounds into another component without ever cutting the surface |
<!-- index:end -->

## Adding or changing a transition

Follow [shared/AUTHORING.md](shared/AUTHORING.md): build `demo.html` on [shared/ui-kit.css](shared/ui-kit.css), write the subskill from the template, then render and self-check with `scripts/render.sh <slug>`. A human reviews `preview.mp4` in the gallery (`scripts/gallery.mjs` writes `review/index.html`; serve the skill root over http and open `/review/`). Only an approved transition is committed and added to the index, one commit per transition.
