"use client"

import type React from "react"
import { useMemo } from "react"

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
  billow?: number // Max billow amount for the wave
  svgForeground?: {
    viewBox: string // e.g., "0 0 900 600"
    paths: SvgPathDefinition[]
  }
}

export function AnimatedFlag({
  backgroundColors,
  className = "",
  numOfColumns = 15, // 100. Increased default for smoother waves on complex designs
  staggeredDelay = 150, // 20
  billow = .8, // 0.02. This is now an increment per column for the wave effect
  svgForeground,
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
    return Array.from({ length: numOfColumns }, (_, index) => ({
      // billowAmount is the actual translateY value for this column's part of the wave
      billowAmount: (index / numOfColumns - 0.5) * (numOfColumns * billow), // Creates a wave shape
      animationDelay: firstColumnDelay + index * staggeredDelay,
    }))
  }, [numOfColumns, billow, firstColumnDelay, staggeredDelay])

  const overallAspectRatio = useMemo(() => {
    if (svgForeground && svgForeground.viewBox) {
      const parts = svgForeground.viewBox.split(" ")
      if (parts.length === 4) {
        const vbWidth = Number.parseFloat(parts[2])
        const vbHeight = Number.parseFloat(parts[3])
        if (vbWidth > 0 && vbHeight > 0) {
          return vbWidth / vbHeight
        }
      }
    }
    return 3 / 2 // Default aspect ratio for standard flags
  }, [svgForeground])

  return (
    <div className={`animated-flag ${className}`} style={{ aspectRatio: `${overallAspectRatio}` }}>
      {columnsData.map((colData, index) => {
        let columnSpecificViewBox = ""
        if (svgForeground && svgForeground.viewBox) {
          const parts = svgForeground.viewBox.split(" ")
          if (parts.length === 4) {
            const vbMinX = Number.parseFloat(parts[0])
            const vbMinY = Number.parseFloat(parts[1])
            const vbWidth = Number.parseFloat(parts[2])
            const vbHeight = Number.parseFloat(parts[3])

            const singleColumnSvgWidth = vbWidth / numOfColumns
            const currentColumnSvgMinX = vbMinX + index * singleColumnSvgWidth
            columnSpecificViewBox = `${currentColumnSvgMinX} ${vbMinY} ${singleColumnSvgWidth} ${vbHeight}`
          }
        }

        return (
          <div
            key={index}
            className="flag-column"
            style={
              {
                "--billow": `${colData.billowAmount}px`, // Use the calculated billowAmount
                background: gradientString,
                animationDelay: `${colData.animationDelay}ms`,
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
