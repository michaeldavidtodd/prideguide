# Overdrive directions — Pride Guide

Reference doc for technically ambitious UI work. Aligned with `.impeccable.md` (pixel × hyper-modern juxtaposition, accessibility, activist energy).

## Direction A — Scroll cinema (CSS-first)

**Intent:** Choreograph the whole page off **document scroll**—hero “hands off” to the main sheet, surfaces feel cinematic without heavy JS.

**Techniques:**

- **Scroll-driven animations** — `animation-timeline: scroll(root block)` with `animation-range` over the first ~1–2 viewports so hero dims/settles and the main panel “lands.”
- **Pixel-read chrome** — Stepped / scanline-style top treatment on the main sheet, optional **8px grid** overlay that **drifts** slowly with scroll (parallax via scroll-linked keyframes).
- **Tab panels** — `@starting-style` + transition when a `TabsContent` becomes visible (Radix removes `hidden`), so each tab feels like a deliberate scene change.
- **Progressive enhancement** — All scroll-linked behavior inside `@supports (animation-timeline: scroll(root block))`. **Firefox** (until full support): same layout, no scroll-linked motion.
- **Reduced motion** — `prefers-reduced-motion: reduce` disables scroll-linked animations and pairs with component-level respect (e.g. Framer `useReducedMotion`, no hero interval).

**Trade-offs:** Lots of tuning in the browser; ranges are magic numbers tied to `100vh` spacer + layout.

**Status:** **Implemented** (see `app/globals.css` — `scroll-cinema-*` — and classes on `app/page.tsx`). Includes a full-width **pride “glitch rip”** (jagged clip + rainbow stripes + chroma offset), a **tall scan overlay** and **jagged equalizer bar** on the spacer, stronger hero dim/scale, heavier main-sheet lift, and a **much more visible** pixel grid. Revisit `animation-range` if hero height or spacer changes.

---

## Direction B — Flag detail as morph (View Transitions API)

**Intent:** Tapping a flag card makes the **same graphic travel** and expand into the detail surface (shared-element / FLIP-like). High “how did a website do that?” factor.

**Techniques:**

- `document.startViewTransition()` + `view-transition-name` on card thumbnail and detail target.
- Same-document only for broad support; **cross-document** transitions are uneven (no Firefox).
- **Reduced motion:** prefer **crossfade** or shortened transition, not the full morph.

**Trade-offs:** Higher implementation and polish cost; must not hurt keyboard / SR users (focus order, `prefers-reduced-motion`).

**Status:** **Not implemented** — candidate for `FlagCardTransition` / card grid follow-up.

---

## Direction C — Live pixel layer (Canvas 2D / aggressive pixel read)

**Intent:** A **chunky pixel buffer** or forced **pixelated** sampling for section edges, “CRT window” frames, or live posterization around flags—**hyper-modern** type and layout wrapped around literal retro digital texture.

**Techniques:**

- Canvas 2D or `image-rendering: pixelated` + stepped transforms; optional **OffscreenCanvas** / worker for heavy paths.
- **Lazy init** when near viewport; **pause** when off-screen.
- **Reduced motion / low power:** static fallback bitmap or effect off.

**Trade-offs:** Performance work on mid-range phones; most engineering overhead of the three.

**Status:** **Not implemented** — use when a specific surface (e.g. hero bezel only) is scoped.

---

## Combinations

- **A + B:** Scroll choreography for the page + morph for flag detail.
- **A + C:** Scroll cinema for structure, pixel layer only on hero or main “frame.”

## Verification checklist (when implementing any direction)

- [ ] `prefers-reduced-motion` — meaningful alternative, not a broken layout  
- [ ] `@supports` fallbacks for scroll-driven or View Transitions  
- [ ] Mid-range device / throttled CPU spot check  
- [ ] Keyboard and focus still make sense  
