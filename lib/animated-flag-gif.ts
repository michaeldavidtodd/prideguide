import type { FlagDefinition } from "@/lib/flags"
import { GIFEncoder, quantize, applyPalette } from "gifenc"

/** Matches `.flag-column` in app/globals.css */
export const FLAG_OSCILLATE_HALF_MS = 650
export const FLAG_OSCILLATE_PERIOD_MS = FLAG_OSCILLATE_HALF_MS * 2

const REFERENCE_LAYOUT_WIDTH_PX = 720

export type AnimatedFlagGifSpec = {
  backgroundColors: string[]
  svgForeground?: FlagDefinition["display"]["svgForeground"]
  numOfColumns: number
  staggeredDelayMs: number
  billow: number
  columnGapPx: number
  stripeCornerRadiusPx?: number
}

export type AnimatedFlagGifEncodeOptions = {
  width: number
  /**
   * GIF frame delay in ms, snapped to 10ms. Use 30–40 ms for smooth + universally honored timing.
   * Delays < 20ms get clamped to ~100ms by many decoders; 20ms works in most browsers but not
   * all chat apps. 30ms (33 fps) is the sweet spot.
   */
  frameDelayMs: number
  waveCycles: number
}

function effectiveGifDelayMs(requestedMs: number): number {
  const cs = Math.max(2, Math.round(requestedMs / 10))
  return cs * 10
}

function parseViewBoxDims(viewBox: string | undefined): { w: number; h: number } | null {
  if (!viewBox) return null
  const parts = viewBox.trim().split(/\s+/).filter(Boolean)
  if (parts.length !== 4) return null
  const vbW = Number.parseFloat(parts[2]!)
  const vbH = Number.parseFloat(parts[3]!)
  if (!Number.isFinite(vbW) || !Number.isFinite(vbH) || vbW <= 0 || vbH <= 0) return null
  return { w: vbW, h: vbH }
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function buildForegroundSvgMarkup(svgForeground: NonNullable<AnimatedFlagGifSpec["svgForeground"]>): string {
  const { viewBox, paths } = svgForeground
  const pathEls = paths
    .map((p) => {
      const attrs: string[] = [`d="${escapeXml(p.d)}"`, `fill="${escapeXml(p.fill || "none")}"`]
      if (p.stroke?.trim()) attrs.push(`stroke="${escapeXml(p.stroke)}"`)
      if (p.strokeWidth?.trim()) attrs.push(`stroke-width="${escapeXml(p.strokeWidth)}"`)
      if (p.transform?.trim()) attrs.push(`transform="${escapeXml(p.transform)}"`)
      return `<path ${attrs.join(" ")} />`
    })
    .join("")
  return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="${escapeXml(viewBox)}">${pathEls}</svg>`
}

function loadSvgDataUrlImage(svgMarkup: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Failed to load flag SVG for GIF export"))
    img.src = url
    if (img.complete && img.naturalWidth > 0) resolve(img)
  })
}

function easeInOutCss(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

function mod(n: number, m: number): number {
  return ((n % m) + m) % m
}

export function billowAmplitudePx(spec: AnimatedFlagGifSpec, exportWidthPx: number): number {
  const n = Math.max(1, Math.floor(spec.numOfColumns))
  const layoutScale = exportWidthPx / REFERENCE_LAYOUT_WIDTH_PX
  return (n / 2) * spec.billow * layoutScale
}

export function columnTranslateYAt(
  globalMs: number,
  columnIndex: number,
  numOfColumns: number,
  staggeredDelayMs: number,
  billowPx: number
): number {
  const delayMs = (columnIndex - numOfColumns) * staggeredDelayMs
  const local = globalMs - delayMs
  if (local < 0) return billowPx

  const e = mod(local, FLAG_OSCILLATE_PERIOD_MS)
  const half = FLAG_OSCILLATE_HALF_MS

  if (e < half) {
    const u = easeInOutCss(e / half)
    return billowPx * (1 - 2 * u)
  }
  const u = easeInOutCss((e - half) / half)
  return billowPx * (-1 + 2 * u)
}

function addStripeGradientStops(
  g: CanvasGradient,
  backgroundColors: string[]
): void {
  if (!backgroundColors.length) {
    g.addColorStop(0, "transparent")
    g.addColorStop(1, "transparent")
    return
  }
  if (backgroundColors.length === 1) {
    g.addColorStop(0, backgroundColors[0]!)
    g.addColorStop(1, backgroundColors[0]!)
    return
  }
  const n = backgroundColors.length
  const segment = 1 / n
  for (let i = 0; i < n; i++) {
    const from = i * segment
    const to = (i + 1) * segment
    const c = backgroundColors[i]!
    g.addColorStop(from, c)
    g.addColorStop(to, c)
  }
}

function columnCornerRadiiPx(
  columnIndex: number,
  numColumns: number,
  columnWidth: number,
  flagHeight: number,
  columnGapPx: number,
  stripeCornerRadiusPx: number | undefined,
  layoutScale: number
): { tl: number; tr: number; br: number; bl: number } {
  const cap = Math.min(columnWidth / 2, flagHeight / 2)
  const defaultEndCap = Math.min(8 * layoutScale, cap)

  if (stripeCornerRadiusPx !== undefined && stripeCornerRadiusPx > 0) {
    const r = Math.min(stripeCornerRadiusPx, cap)
    if (columnGapPx > 0) {
      return { tl: r, tr: r, br: r, bl: r }
    }
    let tl = 0
    let tr = 0
    let br = 0
    let bl = 0
    if (columnIndex === 0) {
      tl = bl = r
    }
    if (columnIndex === numColumns - 1) {
      tr = br = r
    }
    return { tl, tr, br, bl }
  }

  let tl = 0
  let tr = 0
  let br = 0
  let bl = 0
  if (columnIndex === 0) {
    tl = bl = defaultEndCap
  }
  if (columnIndex === numColumns - 1) {
    tr = br = defaultEndCap
  }
  return { tl, tr, br, bl }
}

function clipRoundedColumn(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  tl: number,
  tr: number,
  br: number,
  bl: number
): void {
  const maxR = Math.min(w / 2, h / 2)
  const a = Math.min(Math.max(0, tl), maxR)
  const b = Math.min(Math.max(0, tr), maxR)
  const c = Math.min(Math.max(0, br), maxR)
  const d = Math.min(Math.max(0, bl), maxR)

  ctx.beginPath()
  if (a + b + c + d === 0) {
    ctx.rect(x, y, w, h)
    ctx.clip()
    return
  }

  ctx.moveTo(x + a, y)
  ctx.lineTo(x + w - b, y)
  if (b > 0) {
    ctx.arcTo(x + w, y, x + w, y + b, b)
  }
  ctx.lineTo(x + w, y + h - c)
  if (c > 0) {
    ctx.arcTo(x + w, y + h, x + w - c, y + h, c)
  }
  ctx.lineTo(x + d, y + h)
  if (d > 0) {
    ctx.arcTo(x, y + h, x, y + h - d, d)
  }
  ctx.lineTo(x, y + a)
  if (a > 0) {
    ctx.arcTo(x, y, x + a, y, a)
  }
  ctx.closePath()
  ctx.clip()
}

function renderFlagFrame(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  flagTopY: number,
  flagHeight: number,
  spec: AnimatedFlagGifSpec,
  fgImage: HTMLImageElement | null,
  timeMs: number
): void {
  const n = Math.max(1, Math.floor(spec.numOfColumns))
  const layoutScale = canvasWidth / REFERENCE_LAYOUT_WIDTH_PX
  const gap = Math.max(0, spec.columnGapPx * layoutScale)
  const totalGap = gap * Math.max(0, n - 1)
  const colW = (canvasWidth - totalGap) / n
  const billowPx = billowAmplitudePx(spec, canvasWidth)
  const scaledStripeR =
    spec.stripeCornerRadiusPx !== undefined && spec.stripeCornerRadiusPx > 0
      ? spec.stripeCornerRadiusPx * layoutScale
      : undefined

  ctx.save()
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  const iw = fgImage?.naturalWidth ?? 0
  const ih = fgImage?.naturalHeight ?? 0
  const hasFg = Boolean(fgImage && iw > 0 && ih > 0)

  for (let i = 0; i < n; i++) {
    const x = i * (colW + gap)
    const yOff = columnTranslateYAt(timeMs, i, n, spec.staggeredDelayMs, billowPx)
    const { tl, tr, br, bl } = columnCornerRadiiPx(
      i,
      n,
      colW,
      flagHeight,
      gap,
      scaledStripeR,
      layoutScale
    )

    ctx.save()
    ctx.translate(0, yOff)
    clipRoundedColumn(ctx, x, flagTopY, colW, flagHeight, tl, tr, br, bl)

    const grad = ctx.createLinearGradient(x, flagTopY, x, flagTopY + flagHeight)
    addStripeGradientStops(grad, spec.backgroundColors)
    ctx.fillStyle = grad
    ctx.fillRect(x, flagTopY, colW, flagHeight)

    if (hasFg && fgImage) {
      const sx = (i / n) * iw
      const sw = iw / n
      ctx.drawImage(fgImage, sx, 0, sw, ih, x, flagTopY, colW, flagHeight)
    }

    ctx.restore()
  }

  ctx.restore()
}

export function defaultGifSpecFromFlag(flag: FlagDefinition): AnimatedFlagGifSpec {
  return {
    backgroundColors: flag.display.stripes ?? [],
    svgForeground: flag.display.svgForeground,
    numOfColumns: 18,
    staggeredDelayMs: 150,
    billow: 0.85,
    columnGapPx: 0,
    stripeCornerRadiusPx: undefined,
  }
}

const DEFAULT_ENCODE: AnimatedFlagGifEncodeOptions = {
  width: 1080,
  frameDelayMs: 20,
  waveCycles: 2,
}

function ensureEvenPx(n: number): number {
  return n % 2 === 0 ? n : n + 1
}

async function prepareFlagExportCanvas(
  spec: AnimatedFlagGifSpec,
  width: number
): Promise<{
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  canvasWidth: number
  canvasHeight: number
  flagTopY: number
  flagHeight: number
  fgImage: HTMLImageElement | null
}> {
  if (width < 120 || width > 4096) {
    throw new Error("Export width must be between 120 and 4096 pixels")
  }

  const dims = parseViewBoxDims(spec.svgForeground?.viewBox)
  const ar = dims ? dims.w / dims.h : 3 / 2
  const canvasWidth = ensureEvenPx(width)
  const flagHeight = Math.max(1, Math.round(canvasWidth / ar))
  const padY = Math.ceil(billowAmplitudePx(spec, canvasWidth))
  const canvasHeight = ensureEvenPx(flagHeight + 2 * padY)
  const flagTopY = padY

  let fgImage: HTMLImageElement | null = null
  if (spec.svgForeground?.paths?.length) {
    fgImage = await loadSvgDataUrlImage(buildForegroundSvgMarkup(spec.svgForeground))
  }

  const canvas = document.createElement("canvas")
  canvas.width = canvasWidth
  canvas.height = canvasHeight
  const ctx = canvas.getContext("2d", { alpha: true })
  if (!ctx) throw new Error("Could not get 2D canvas context")

  return { canvas, ctx, canvasWidth, canvasHeight, flagTopY, flagHeight, fgImage }
}

const TRANSPARENT_KEY_R = 254
const TRANSPARENT_KEY_G = 0
const TRANSPARENT_KEY_B = 254

function rgbaToChromaKeyTransparent(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3]! < 128) {
      data[i] = TRANSPARENT_KEY_R
      data[i + 1] = TRANSPARENT_KEY_G
      data[i + 2] = TRANSPARENT_KEY_B
      data[i + 3] = 255
    }
  }
}

function isChromaKeyPixel(data: Uint8ClampedArray, i: number): boolean {
  return (
    data[i] === TRANSPARENT_KEY_R &&
    data[i + 1] === TRANSPARENT_KEY_G &&
    data[i + 2] === TRANSPARENT_KEY_B
  )
}

function findTransparentPaletteIndex(palette: number[][]): number {
  const exact = palette.findIndex(
    (p) => p[0] === TRANSPARENT_KEY_R && p[1] === TRANSPARENT_KEY_G && p[2] === TRANSPARENT_KEY_B
  )
  if (exact >= 0) return exact
  let best = 0
  let bestD = Infinity
  for (let i = 0; i < palette.length; i++) {
    const p = palette[i]!
    const dr = p[0]! - TRANSPARENT_KEY_R
    const dg = p[1]! - TRANSPARENT_KEY_G
    const db = p[2]! - TRANSPARENT_KEY_B
    const d = dr * dr + dg * dg + db * db
    if (d < bestD) {
      bestD = d
      best = i
    }
  }
  return best
}

function applyTransparentIndexToChromaKey(
  index: Uint8Array,
  keyedRgba: Uint8ClampedArray,
  width: number,
  height: number,
  transparentIndex: number
): void {
  const n = width * height
  for (let p = 0, i = 0; p < n; p++, i += 4) {
    if (isChromaKeyPixel(keyedRgba, i)) {
      index[p] = transparentIndex
    }
  }
}

/**
 * Encode animated flag GIF.
 *
 * Default: 720px wide, 30ms/frame (3cs GCE delay → ~33fps), 2 wave cycles.
 * 1300ms period / 30ms = ~43 frames per cycle — smooth enough, and 30ms (3cs)
 * is reliably honored by browsers, macOS Preview, Slack, iMessage, Discord, etc.
 * The old 20ms (2cs) delay was being clamped to 100ms by some viewers.
 */
export async function encodeAnimatedFlagGif(
  spec: AnimatedFlagGifSpec,
  options: Partial<AnimatedFlagGifEncodeOptions> = {}
): Promise<Blob> {
  const width = options.width ?? DEFAULT_ENCODE.width
  const waveCycles = options.waveCycles ?? DEFAULT_ENCODE.waveCycles
  const delayMs = effectiveGifDelayMs(options.frameDelayMs ?? DEFAULT_ENCODE.frameDelayMs)

  const { ctx, canvasWidth, canvasHeight, flagTopY, flagHeight, fgImage } =
    await prepareFlagExportCanvas(spec, width)

  const framesPerPeriod = Math.max(1, Math.round(FLAG_OSCILLATE_PERIOD_MS / delayMs))
  const totalFrames = framesPerPeriod * Math.max(1, waveCycles)
  const simStepMs = FLAG_OSCILLATE_PERIOD_MS / framesPerPeriod

  const gif = GIFEncoder()
  let globalPalette: ReturnType<typeof quantize> | null = null
  let transparentIndex = 0

  for (let f = 0; f < totalFrames; f++) {
    const t = f * simStepMs
    renderFlagFrame(ctx, canvasWidth, canvasHeight, flagTopY, flagHeight, spec, fgImage, t)
    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight)
    const keyed = new Uint8ClampedArray(imageData.data)
    rgbaToChromaKeyTransparent(keyed)

    if (f === 0) {
      globalPalette = quantize(keyed, 256)
      transparentIndex = findTransparentPaletteIndex(globalPalette)
    }
    const palette = globalPalette!
    const index = applyPalette(keyed, palette)
    applyTransparentIndexToChromaKey(index, keyed, canvasWidth, canvasHeight, transparentIndex)

    if (f === 0) {
      gif.writeFrame(index, canvasWidth, canvasHeight, {
        palette,
        delay: delayMs,
        transparent: true,
        transparentIndex,
        repeat: 0,
      })
    } else {
      gif.writeFrame(index, canvasWidth, canvasHeight, {
        delay: delayMs,
        transparent: true,
        transparentIndex,
      })
    }
  }

  gif.finish()
  return new Blob([new Uint8Array(gif.bytes())], { type: "image/gif" })
}

export function gifFilenameForFlag(flagId: string): string {
  const safe = flagId.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-|-$/g, "") || "flag"
  return `${safe}-pride-guide.gif`
}

function triggerAnimationDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  try {
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.rel = "noopener"
    document.body.appendChild(a)
    a.click()
    a.remove()
  } finally {
    window.setTimeout(() => URL.revokeObjectURL(url), 4000)
  }
}

export async function downloadAnimatedFlagGif(
  spec: AnimatedFlagGifSpec,
  flagId: string,
  encodeOptions?: Partial<AnimatedFlagGifEncodeOptions>
): Promise<void> {
  const blob = await encodeAnimatedFlagGif(spec, encodeOptions)
  triggerAnimationDownload(blob, gifFilenameForFlag(flagId))
}
