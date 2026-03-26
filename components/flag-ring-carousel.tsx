"use client"

import type { MouseEvent as ReactMouseEvent } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { motion } from "framer-motion"
import { AnimatedFlag } from "@/components/animated-flag"

type RingFlag = {
  id: string
  name: string
  display: {
    stripes?: string[]
    svgForeground?: {
      viewBox: string
      paths: { id: string; d: string; fill: string; transform?: string; stroke?: string; strokeWidth?: string }[]
    }
  }
}

type FlagRingCarouselProps<F extends RingFlag> = {
  flags: readonly F[]
  onSelect: (flag: F, event: ReactMouseEvent<HTMLElement>) => void
}

const MIN_RING_ITEMS = 18

export function FlagRingCarousel<F extends RingFlag>({ flags, onSelect }: FlagRingCarouselProps<F>) {
  const [rotationY, setRotationY] = useState(0)
  const targetRotationRef = useRef(0)
  const isDraggingRef = useRef(false)
  const lastFrameTimeRef = useRef<number | null>(null)

  useEffect(() => {
    let frameId = 0

    const animate = (time: number) => {
      if (lastFrameTimeRef.current === null) {
        lastFrameTimeRef.current = time
      }

      const deltaMs = Math.min(64, time - lastFrameTimeRef.current)
      lastFrameTimeRef.current = time

      if (!isDraggingRef.current) {
        targetRotationRef.current += deltaMs * 0.006
      }

      setRotationY((prev) => {
        const next = prev + (targetRotationRef.current - prev) * 0.12
        if (Math.abs(next - prev) < 0.001) {
          return targetRotationRef.current
        }
        return next
      })

      frameId = window.requestAnimationFrame(animate)
    }

    frameId = window.requestAnimationFrame(animate)
    return () => {
      window.cancelAnimationFrame(frameId)
      lastFrameTimeRef.current = null
    }
  }, [])

  const ringItems = useMemo(() => {
    if (flags.length === 0) return [] as { key: string; flag: F }[]

    const targetCount = Math.max(flags.length, MIN_RING_ITEMS)
    const items: { key: string; flag: F }[] = []
    for (let index = 0; index < targetCount; index += 1) {
      const flag = flags[index % flags.length]
      items.push({ key: `${flag.id}-${index}`, flag })
    }

    return items
  }, [flags])

  const ring = useMemo(() => {
    const count = Math.max(ringItems.length, 1)
    const arcSpan = 360
    const step = arcSpan / count
    const radius = Math.max(900, Math.min(1800, count * 65))
    return { step, radius, arcSpan }
  }, [ringItems.length])

  return (
    <div className="relative h-[60rem] w-full overflow-hidden [perspective:2600px]">
      <motion.div
        onPanStart={() => {
          isDraggingRef.current = true
        }}
        onPan={(_, info) => {
          targetRotationRef.current -= info.delta.x * 0.32
        }}
        onPanEnd={() => {
          isDraggingRef.current = false
        }}
        className="absolute left-1/2 top-1/2 h-0 w-0 cursor-grab touch-pan-y active:cursor-grabbing [transform-style:preserve-3d]"
        style={{ rotateY: rotationY, scale: 1.8 }}
      >
        {ringItems.map(({ key, flag }, index) => {
          const angle = -ring.arcSpan / 2 + index * ring.step + 180
          const absoluteAngle = angle + rotationY
          const normalized = ((((absoluteAngle % 360) + 360) % 360) + 180) % 360 - 180
          const radians = (normalized * Math.PI) / 180
          const closeness = (Math.cos(radians) + 1) / 2
          const isBackHalf = Math.cos(radians) < 0
          return (
            <div
              key={key}
              className="absolute -left-[14rem] -top-[13.5rem] w-[28rem] [backface-visibility:hidden] [transform-style:preserve-3d]"
              style={{
                transform: `rotateY(${angle}deg) translateZ(${ring.radius}px) rotateY(180deg)`,
                zIndex: Math.round((closeness + 1) * 1200),
                opacity: isBackHalf ? 1 : 0,
                pointerEvents: isBackHalf ? "auto" : "none",
              }}
            >
              <button
                type="button"
                onClick={(event) => onSelect(flag, event)}
                className="flag-container group w-full text-left transition-transform duration-200 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                style={{ transform: "scale(0.86)" }}
                aria-label={`Open details for ${flag.name}`}
              >
                <AnimatedFlag
                  backgroundColors={flag.display.stripes || []}
                  svgForeground={flag.display.svgForeground}
                  className="h-64 w-full overflow-hidden"
                />
                <p className="mt-2 truncate text-3xl font-semibold tracking-tight">{flag.name}</p>
              </button>
            </div>
          )
        })}
      </motion.div>
    </div>
  )
}
