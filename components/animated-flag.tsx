"use client"

import type React from "react"
import { useMemo } from "react"

interface AnimatedFlagProps {
  colors: string[]
  className?: string
  numOfColumns?: number
  staggeredDelay?: number
  billow?: number
}

export function AnimatedFlag({
  colors,
  className = "",
  numOfColumns = 100,
  staggeredDelay = 20,
  billow = .02,
}: AnimatedFlagProps) {
  // Generate gradient string with hard stops (no blending between colors)
  const gradientString = useMemo(() => {
    const numOfColors = colors.length
    const segmentHeight = 100 / numOfColors

    const gradientStops = colors.map((color, index) => {
      const from = Math.round(index * segmentHeight * 100) / 100
      const to = Math.round((index + 1) * segmentHeight * 100) / 100
      return `${color} ${from}% ${to}%`
    })

    return `linear-gradient(to bottom, ${gradientStops.join(", ")})`
  }, [colors])

  // Calculate first column delay for smooth wave effect
  const firstColumnDelay = numOfColumns * staggeredDelay * -1

  // Generate column data
  const columns = useMemo(() => {
    return Array.from({ length: numOfColumns }, (_, index) => ({
      billow: index * billow,
      animationDelay: firstColumnDelay + index * staggeredDelay,
    }))
  }, [numOfColumns, billow, firstColumnDelay, staggeredDelay])

  return (
    <div className={`animated-flag ${className}`}>
      {columns.map((column, index) => (
        <div
          key={index}
          className="flag-column"
          style={
            {
              "--billow": `${column.billow}px`,
              background: gradientString,
              animationDelay: `${column.animationDelay}ms`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  )
}
