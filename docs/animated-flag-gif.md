# Animated flag GIF export

The explore UI and share flows download a waving flag as an animated GIF. Encoding lives in [`lib/animated-flag-gif.ts`](../lib/animated-flag-gif.ts). This document explains how that output stays aligned with the in-browser [`AnimatedFlag`](../components/animated-flag.tsx) and why export dimensions are chosen the way they are.

## What the browser draws

`AnimatedFlag` builds **N vertical columns**. Each column shows:

1. A **linear gradient** for the stripe colors (same for every column).
2. Optionally an **SVG foreground** (chevrons, crosses, etc.). For each column, the component sets a **column-specific `viewBox`**: a horizontal slice of the full flag `viewBox`, with `preserveAspectRatio="none"` so that slice fills the column. That keeps diagonal or complex artwork continuous across columns when gaps are zero, and correctly samples each strip when there are gaps.

GIF export must reproduce the same **per-column geometry** and **per-column slice of the foreground** or complex flags will look stretched, stair-stepped, or misaligned relative to the stripes.

## Reference layout width (720px)

All layout math is defined relative to a **720px-wide** reference, matching how the studio and GIF spec describe `columnGapPx` and billow. Export scale is an integer or rational multiple of that reference so gaps and column widths stay **whole pixels** at the chosen output size.

Constants of note:

- `REFERENCE_LAYOUT_WIDTH_PX = 720`
- `FLAG_OSCILLATE_HALF_MS` / `FLAG_OSCILLATE_PERIOD_MS` match `.flag-column` timing in `app/globals.css`.

## Choosing export width (integer columns and gaps)

The encoder does **not** force an arbitrary width (e.g. exactly 1080) if that would make `(width − totalGap) / N` fractional. Fractional column widths and gaps produce uneven pixels in the GIF and break alignment with the DOM.

### Primary path: `k × 720`

Let:

- `N` = number of columns (`numOfColumns`)
- `gapRef` = `columnGapPx` at the 720px reference (integer)
- `baseUsable = 720 − gapRef × (N − 1)` = flag pixel width excluding gaps at reference scale

At integer scale `k`:

- `canvasWidth = k × 720`
- `gapPx = gapRef × k`
- `usable = canvasWidth − gapPx × (N − 1) = k × baseUsable`
- `colW = usable / N` must be an integer

So we need `k × baseUsable ≡ 0 (mod N)`. Writing `g = gcd(baseUsable, N)`, valid `k` values are multiples of **`N / g`**. The resolver scans `k = step, 2×step, …` (with `step = N / g`) within **120–4096** px width and picks the width **closest** to the requested target; on a tie it prefers the **larger** width for quality.

### Fallback path

Some `(N, gapRef)` combinations never yield a valid `k × 720` within the max width (e.g. very large `step`). Then the encoder scans **even** widths from 120 to 4096, uses `gapPx = round(gapRef × width / 720)`, and keeps only widths where `(width − gapPx × (N − 1))` is positive and divisible by `N`. Again it picks the closest to the target (tie → larger).

`AnimatedFlagGifEncodeOptions.width` is therefore a **target**, not a guarantee.

## Foreground SVG rasterization

If the flag defines `svgForeground`, the exporter builds an SVG string and loads it as an image. The SVG is given explicit **`width` and `height`** in pixels:

- **Width** = `usableFlagWidth` = `N × colW` (the flag area not counting inter-column gaps). This matches the sum of column widths on the canvas.
- **Height** = `round(width / aspectRatio)` using the same aspect ratio as the full flag (`viewBox` or default 3∶2).

That raster is exactly **`N` equal horizontal strips** of `colW` source pixels per column—the same sampling as **`colW` units of viewBox width per column** in the browser. Each frame copies strip `i` with integer `sx` / `sw` (last column absorbs any ±1 decode rounding). `imageSmoothingEnabled` is turned **off** when drawing so strips are not blurred together.

Stripe-only flags omit the foreground image; columns are filled with the same linear gradient as before.

## Frame rendering and encoding

For each time step:

1. The canvas is cleared; each column is clipped to its rounded rect, translated vertically by the same billow phase as the CSS animation (`columnTranslateYAt`, etc.).
2. The gradient and optional foreground strip are drawn.
3. Pixels with alpha &lt; 128 are remapped to a chroma key, quantized with `gifenc`, and written as a frame with transparency.

Details (palette, transparent index, delay snapping) are in the source file comments.

## Public entry points

| Export | Role |
|--------|------|
| `defaultGifSpecFromFlag` | Builds a default `AnimatedFlagGifSpec` from a `FlagDefinition` (share / card flows). |
| `encodeAnimatedFlagGif` | Returns a `Blob`; resolves layout width internally. |
| `downloadAnimatedFlagGif` | Encodes and triggers a download. |
| `billowAmplitudePx` / `columnTranslateYAt` | Shared timing math (also useful if you preview amplitude elsewhere). |
| `gifFilenameForFlag` | Safe filename for downloads. |

The explore studio builds `AnimatedFlagGifSpec` from live controls (`columnCount`, `stripeGap`, etc.) in `pride-home-client.tsx` and passes it to the same download helper.

## Related files

- [`components/animated-flag.tsx`](../components/animated-flag.tsx) — DOM column layout and per-column SVG `viewBox`.
- [`app/globals.css`](../app/globals.css) — `.animated-flag`, `.flag-column` animation.
