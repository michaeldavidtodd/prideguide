"use client"

import type React from "react"
import { useMemo } from "react"
import { cn } from "@/lib/utils"

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
}: AnimatedFlagProps) {
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
    if (columnGapPx > 0) {
      s.gap = columnGapPx
    }
    return s
  }, [columnGapPx, fit, overallAspectRatio])

  const columnBorderRadius = useMemo(() => {
    if (stripeCornerRadiusPx === undefined) {
      return (_index: number) => ({} as React.CSSProperties)
    }
    const r = stripeCornerRadiusPx
    if (columnGapPx > 0) {
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
  }, [columnGapPx, numOfColumns, stripeCornerRadiusPx])

  return (
    <div
      className={cn(
        "animated-flag",
        fit === "contain" && "animated-flag--contain",
        className,
        stripeCornerRadiusPx !== undefined && "animated-flag--radius-controlled"
      )}
      style={rootStyle}
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

        return (
          <div
            key={index}
            className="flag-column"
            style={
              {
                "--billow": `${colData.billowAmount}px`, // Use the calculated billowAmount
                background: gradientString,
                animationDelay: `${colData.animationDelay}ms`,
                ...radiusStyle,
              } as React.CSSProperties
            }
          >
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
