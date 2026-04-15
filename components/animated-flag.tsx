"use client"

import type React from "react"
import { useLayoutEffect, useMemo, useRef, useState } from "react"
import { cn } from "@/lib/utils"

const FLAG_COLUMN_MIN_WIDTH_PX = 1

/**
 * Horizontal gap clamped so each column can be at least `FLAG_COLUMN_MIN_WIDTH_PX` wide
 * inside `containerWidthPx` (flex: n·minW + (n−1)·gap ≤ width).
 * When width is not laid out yet (0), uses a viewport fallback so max gap + max columns
 * does not consume the whole row before ResizeObserver fires (common on mobile).
 */
export function effectiveFlagColumnGapPx(
  requestedGapPx: number,
  numColumns: number,
  containerWidthPx: number,
): number {
  const requested = Math.max(0, requestedGapPx)
  if (numColumns <= 1) return requested

  let w = containerWidthPx
  if (!Number.isFinite(w) || w <= 0) {
    if (typeof window !== "undefined" && window.innerWidth > 0) {
      /* Underestimate row width until ResizeObserver runs (margins / max-width < innerWidth). */
      w = Math.max(numColumns * FLAG_COLUMN_MIN_WIDTH_PX, window.innerWidth * 0.38)
    } else {
      return 0
    }
  }

  const minBand = numColumns * FLAG_COLUMN_MIN_WIDTH_PX
  if (w <= minBand) return 0
  const maxGap = (w - minBand) / (numColumns - 1)
  return Math.min(requested, maxGap)
}

interface SvgPathDefinition {
  d: string
  fill: string
  id: string
  transform?: string
  stroke?: string
  strokeWidth?: string
}

interface AnimatedFlagProps {
  backgroundColors: string[] // Stripes or solid color for background
  className?: string
  numOfColumns?: number
  staggeredDelay?: number
  /** Scales vertical oscillation amplitude (px). Wave travel along the flag uses staggered delays, not this value per column. */
  billow?: number
  /** Horizontal gap between column slices (px). Slight seams may appear on SVG-overlay flags. */
  columnGapPx?: number
  /**
   * When set, controls rounding on stripe columns (overrides default 8px end caps in CSS).
   * With columnGapPx &gt; 0, applies the same radius to every column.
   */
  stripeCornerRadiusPx?: number
  svgForeground?: {
    viewBox: string // e.g., "0 0 900 600"
    paths: SvgPathDefinition[]
  }
  /**
   * `fill` — span parent width (default).
   * `contain` — scale uniformly inside a parent with a definite height (see `.animated-flag--contain`).
   */
  fit?: "fill" | "contain"
  style?: React.CSSProperties
  /**
   * When set, the root drop shadow uses this color (e.g. hex) at 40% mix with transparent,
   * matching the default `.animated-flag` glow strength.
   */
  dropShadowColor?: string
  /**
   * When true, the column wave is frozen with `animation-play-state: paused` — same `oscillate`
   * keyframes and staggered delays as the animated flag (one snapshot of the live wave).
   */
  motionless?: boolean
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

export function AnimatedFlag({
  backgroundColors,
  className = "",
  numOfColumns = 15, // 100. Increased default for smoother waves on complex designs
  staggeredDelay = 150, // 20
  billow = 0.8,
  columnGapPx = 0,
  stripeCornerRadiusPx,
  svgForeground,
  fit = "fill",
  style,
  dropShadowColor,
  motionless = false,
}: AnimatedFlagProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [containerWidthPx, setContainerWidthPx] = useState(0)

  useLayoutEffect(() => {
    const el = rootRef.current
    if (!el) return
    const read = () => {
      const rw = el.getBoundingClientRect().width
      const cw = el.clientWidth
      const w = Number.isFinite(rw) && rw > 0 ? rw : cw > 0 ? cw : 0
      setContainerWidthPx(w)
    }
    read()
    const ro = new ResizeObserver(() => read())
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const effectiveColumnGapPx = useMemo(
    () => effectiveFlagColumnGapPx(columnGapPx, numOfColumns, containerWidthPx),
    [columnGapPx, containerWidthPx, numOfColumns],
  )

  const gradientString = useMemo(() => {
    if (!backgroundColors || backgroundColors.length === 0) return "transparent"
    if (backgroundColors.length === 1) return backgroundColors[0] // Solid color

    const numOfBgColors = backgroundColors.length
    const segmentHeight = 100 / numOfBgColors
    const gradientStops = backgroundColors.map((color, index) => {
      const from = Math.round(index * segmentHeight * 100) / 100
      const to = Math.round((index + 1) * segmentHeight * 100) / 100
      return `${color} ${from}% ${to}%`
    })
    return `linear-gradient(to bottom, ${gradientStops.join(", ")})`
  }, [backgroundColors])

  const firstColumnDelay = numOfColumns * staggeredDelay * -1

  const columnsData = useMemo(() => {
    // Same amplitude every column so the middle doesn't go flat; horizontal wave is from staggered animation-delay.
    const billowAmount = (numOfColumns / 2) * billow
    return Array.from({ length: numOfColumns }, (_, index) => ({
      billowAmount,
      animationDelay: firstColumnDelay + index * staggeredDelay,
    }))
  }, [numOfColumns, billow, firstColumnDelay, staggeredDelay])

  const overallAspectRatio = useMemo(() => {
    const dims = parseViewBoxDims(svgForeground?.viewBox)
    if (dims) return dims.w / dims.h
    return 3 / 2
  }, [svgForeground?.viewBox])

  const rootStyle = useMemo((): React.CSSProperties => {
    const s: React.CSSProperties = {}
    if (fit === "contain") {
      ;(s as Record<string, string>)["--flag-ar"] = String(overallAspectRatio)
    } else {
      s.aspectRatio = overallAspectRatio
    }
    if (effectiveColumnGapPx > 0) {
      s.gap = effectiveColumnGapPx
    }
    if (dropShadowColor !== undefined && dropShadowColor.length > 0) {
      s.filter = `drop-shadow(0 0 7rem color-mix(in srgb, ${dropShadowColor} 70%, transparent))`
    }
    return s
  }, [dropShadowColor, effectiveColumnGapPx, fit, overallAspectRatio])

  const columnBorderRadius = useMemo(() => {
    if (stripeCornerRadiusPx === undefined) {
      return (_index: number) => ({} as React.CSSProperties)
    }
    const r = stripeCornerRadiusPx
    if (effectiveColumnGapPx > 0) {
      return (_index: number) =>
        ({
          borderRadius: r,
        }) as React.CSSProperties
    }
    return (index: number) => {
      const edge: React.CSSProperties = {}
      if (index === 0) {
        edge.borderTopLeftRadius = r
        edge.borderBottomLeftRadius = r
      }
      if (index === numOfColumns - 1) {
        edge.borderTopRightRadius = r
        edge.borderBottomRightRadius = r
      }
      return edge
    }
  }, [effectiveColumnGapPx, numOfColumns, stripeCornerRadiusPx])

  return (
    <div
      ref={rootRef}
      className={cn(
        "animated-flag",
        fit === "contain" && "animated-flag--contain",
        motionless && "animated-flag--static",
        className,
        stripeCornerRadiusPx !== undefined && "animated-flag--radius-controlled"
      )}
      style={{ ...rootStyle, ...style }}
    >
      {columnsData.map((colData, index) => {
        let columnSpecificViewBox = ""
        const parsed = parseViewBoxDims(svgForeground?.viewBox)
        if (parsed && svgForeground?.viewBox) {
          const parts = svgForeground.viewBox.trim().split(/\s+/).filter(Boolean)
          if (parts.length === 4) {
            const vbMinX = Number.parseFloat(parts[0]!)
            const vbMinY = Number.parseFloat(parts[1]!)
            const vbWidth = parsed.w
            const vbHeight = parsed.h

            const singleColumnSvgWidth = vbWidth / numOfColumns
            const currentColumnSvgMinX = vbMinX + index * singleColumnSvgWidth
            columnSpecificViewBox = `${currentColumnSvgMinX} ${vbMinY} ${singleColumnSvgWidth} ${vbHeight}`
          }
        }

        const radiusStyle = columnBorderRadius(index)

        const columnStyle: React.CSSProperties = {
          ...radiusStyle,
          background: gradientString,
          animationDelay: `${colData.animationDelay}ms`,
        }
        ;(columnStyle as Record<string, string | undefined>)["--billow"] = `${colData.billowAmount}px`

        return (
          <div key={index} className="flag-column" style={columnStyle}>
            {svgForeground && svgForeground.paths.length > 0 && columnSpecificViewBox && (
              <svg
                width="100%"
                height="100%"
                viewBox={columnSpecificViewBox}
                preserveAspectRatio="none" // Crucial for stretching the slice to fill the column
                style={{ display: "block" }} // Prevents extra space below SVG
              >
                {/* Render all paths; the viewBox will clip them */}
                {svgForeground.paths.map((path) => (
                  <path
                    key={path.id}
                    d={path.d}
                    fill={path.fill || "none"}
                    stroke={path.stroke}
                    strokeWidth={path.strokeWidth}
                    transform={path.transform} // Apply any specific transforms for paths
                  />
                ))}
              </svg>
            )}
          </div>
        )
      })}
    </div>
  )
}
