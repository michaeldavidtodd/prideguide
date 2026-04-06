import { canonicalFlagHex } from "@/lib/flags"

const MIN_STRIPE_CONTRAST = 3

function parseCssHslTriplet(raw: string): { h: number; s: number; l: number } | null {
  const parts = raw.trim().split(/\s+/).filter(Boolean)
  if (parts.length < 3) return null
  const h = Number.parseFloat(parts[0]!)
  const s = Number.parseFloat(parts[1]!.replace("%", ""))
  const l = Number.parseFloat(parts[2]!.replace("%", ""))
  if (![h, s, l].every(Number.isFinite)) return null
  return { h, s, l }
}

/** HSL (deg, 0–100, 0–100) → sRGB channels in 0–1. */
function hslToRgb01(h: number, s: number, l: number): [number, number, number] {
  const ss = s / 100
  const ll = l / 100
  const a = ss * Math.min(ll, 1 - ll)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    return ll - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
  }
  return [f(0), f(8), f(4)]
}

function hexToRgb01(hex: string): [number, number, number] | null {
  const h = hex.trim().replace(/^#/, "")
  if (!h) return null
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h
  if (full.length !== 6) return null
  const n = Number.parseInt(full, 16)
  if (Number.isNaN(n)) return null
  return [(n >> 16) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

function srgbChannelToLinear(c: number): number {
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

function relativeLuminance(r: number, g: number, b: number): number {
  return (
    0.2126 * srgbChannelToLinear(r) +
    0.7152 * srgbChannelToLinear(g) +
    0.0722 * srgbChannelToLinear(b)
  )
}

function contrastRatio(lumA: number, lumB: number): number {
  const L1 = Math.max(lumA, lumB)
  const L2 = Math.min(lumA, lumB)
  return (L1 + 0.05) / (L2 + 0.05)
}

function luminanceFromHex(hex: string): number | null {
  const rgb = hexToRgb01(hex)
  if (!rgb) return null
  return relativeLuminance(rgb[0], rgb[1], rgb[2])
}

function luminanceFromHslTriplet(triplet: string): number | null {
  const p = parseCssHslTriplet(triplet)
  if (!p) return null
  const [r, g, b] = hslToRgb01(p.h, p.s, p.l)
  return relativeLuminance(r, g, b)
}

function sameHex(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase()
}

/**
 * Unique flag stripe colors + aurora blob picks (normalized hex) for contrast scoring.
 */
export function collectWelcomeStripeCandidates(
  stripes: string[] | undefined,
  blob1: string,
  blob2: string,
  blob3: string
): string[] {
  const fromStripes = (stripes ?? [])
    .map((s) => canonicalFlagHex(s.trim()) ?? s.trim())
    .filter((c) => c.length > 0)
  const blobs = [blob1, blob2, blob3].map((s) => canonicalFlagHex(s.trim()) ?? s.trim())
  const seen = new Set<string>()
  const out: string[] = []
  for (const c of [...fromStripes, ...blobs]) {
    const k = c.toLowerCase()
    if (seen.has(k)) continue
    seen.add(k)
    out.push(c)
  }
  return out
}

/** Achromatic pair with clear hierarchy: strong primary + softer secondary. */
function neutralGrayPairForBackgroundLuminance(bgLum: number): { text1: string; text2: string } {
  if (bgLum > 0.5) {
    return { text1: "oklch(0.22 0 0)", text2: "oklch(0.4 0 0)" }
  }
  return { text1: "oklch(0.93 0 0)", text2: "oklch(0.68 0 0)" }
}

/**
 * Picks two text colors with the highest WCAG contrast vs theme `--background`.
 * Uses two flag stripes only when both meet the contrast floor; otherwise a neutral gray pair
 * (avoids theme foreground/muted hues that clash with soft flags like the trans palette).
 */
export function pickWelcomeTextColorsAgainstBackground(
  backgroundTriplet: string,
  stripeHexCandidates: string[]
): { text1: string; text2: string } {
  const bgLum = luminanceFromHslTriplet(backgroundTriplet)
  const neutrals = neutralGrayPairForBackgroundLuminance(bgLum ?? 0.5)
  if (bgLum === null) {
    return neutrals
  }

  const scored = stripeHexCandidates
    .map((hex) => {
      const lum = luminanceFromHex(hex)
      if (lum === null) return null
      return { hex, ratio: contrastRatio(lum, bgLum) }
    })
    .filter((x): x is { hex: string; ratio: number } => x !== null)
    .sort((a, b) => b.ratio - a.ratio)

  if (scored.length === 0) {
    return neutrals
  }

  const best = scored[0]!
  if (best.ratio < MIN_STRIPE_CONTRAST) {
    return neutrals
  }

  const second = scored.find((s) => !sameHex(s.hex, best.hex) && s.ratio >= MIN_STRIPE_CONTRAST)
  if (!second) {
    return neutrals
  }

  return { text1: best.hex, text2: second.hex }
}
