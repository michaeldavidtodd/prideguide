"use client"

import type { MouseEvent as ReactMouseEvent } from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useTransform } from "framer-motion"
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

const MIN_RING_ITEMS = 14
const MIN_RING_ITEMS_LOW = 9

type RingItemProps<F extends RingFlag> = {
  keyId: string
  flag: F
  angle: number
  radius: number
  rotationY: ReturnType<typeof useMotionValue<number>>
  onSelect: (flag: F, event: ReactMouseEvent<HTMLElement>) => void
}

function RingItem<F extends RingFlag>({ keyId, flag, angle, radius, rotationY, onSelect }: RingItemProps<F>) {
  const opacity = useTransform(rotationY, (value) => {
    const absoluteAngle = angle + value
    const normalized = ((((absoluteAngle % 360) + 360) % 360) + 180) % 360 - 180
    return Math.cos((normalized * Math.PI) / 180) < 0 ? 1 : 0
  })
  const zIndex = useTransform(rotationY, (value) => {
    const absoluteAngle = angle + value
    const normalized = ((((absoluteAngle % 360) + 360) % 360) + 180) % 360 - 180
    const closeness = (Math.cos((normalized * Math.PI) / 180) + 1) / 2
    return Math.round((closeness + 1) * 1200)
  })
  const pointerEvents = useTransform(opacity, (value) => (value > 0.5 ? "auto" : "none"))

  return (
    <motion.div
      key={keyId}
      className="absolute -left-[14rem] -top-[13.5rem] w-[28rem] [backface-visibility:hidden] [transform-style:preserve-3d]"
      style={{
        transform: `rotateY(${angle}deg) translateZ(${radius}px) rotateY(180deg)`,
        zIndex,
        opacity,
        pointerEvents,
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
    </motion.div>
  )
}

export function FlagRingCarousel<F extends RingFlag>({ flags, onSelect }: FlagRingCarouselProps<F>) {
  const [isLowPowerMode, setIsLowPowerMode] = useState(false)
  const rotationY = useMotionValue(0)
  const targetRotationRef = useRef(0)
  const currentRotationRef = useRef(0)
  const isDraggingRef = useRef(false)
  const lastFrameTimeRef = useRef(0)
  const shouldReduceMotion = useReducedMotion()
  const autoRotateSpeed = isLowPowerMode ? 0.0036 : 0.006
  const dragSensitivity = isLowPowerMode ? 0.24 : 0.32
  const ringScale = isLowPowerMode ? 1.45 : 1.8

  useEffect(() => {
    const cores = typeof navigator !== "undefined" ? navigator.hardwareConcurrency ?? 8 : 8
    const memory = typeof navigator !== "undefined" ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8 : 8
    const smallViewport = typeof window !== "undefined" ? window.innerWidth < 900 : false
    setIsLowPowerMode(smallViewport || cores <= 6 || memory <= 4)
  }, [])

  useAnimationFrame((time) => {
    if (lastFrameTimeRef.current === 0) {
      lastFrameTimeRef.current = time
      return
    }

    const deltaMs = Math.min(64, time - lastFrameTimeRef.current)
    lastFrameTimeRef.current = time

    if (!isDraggingRef.current && !shouldReduceMotion) {
      targetRotationRef.current += deltaMs * autoRotateSpeed
    }

    const current = currentRotationRef.current
    const next = current + (targetRotationRef.current - current) * 0.12
    currentRotationRef.current = next
    rotationY.set(next)
  })

  const ringItems = useMemo(() => {
    if (flags.length === 0) return [] as { key: string; flag: F }[]

    const targetCount = Math.max(flags.length, isLowPowerMode ? MIN_RING_ITEMS_LOW : MIN_RING_ITEMS)
    const items: { key: string; flag: F }[] = []
    for (let index = 0; index < targetCount; index += 1) {
      const flag = flags[index % flags.length]
      items.push({ key: `${flag.id}-${index}`, flag })
    }

    return items
  }, [flags, isLowPowerMode])

  const ring = useMemo(() => {
    const count = Math.max(ringItems.length, 1)
    const arcSpan = 360
    const step = arcSpan / count
    const radius = isLowPowerMode ? Math.max(700, Math.min(1200, count * 52)) : Math.max(900, Math.min(1800, count * 65))
    return { step, radius, arcSpan }
  }, [ringItems.length, isLowPowerMode])

  return (
    <div className="relative h-[58vh] min-h-[28rem] max-h-[52rem] w-full overflow-hidden [perspective:2600px]">
      <motion.div
        onPanStart={() => {
          isDraggingRef.current = true
        }}
        onPan={(_, info) => {
          targetRotationRef.current -= info.delta.x * dragSensitivity
          if (shouldReduceMotion) {
            currentRotationRef.current = targetRotationRef.current
            rotationY.set(targetRotationRef.current)
          }
        }}
        onPanEnd={() => {
          isDraggingRef.current = false
        }}
        className="absolute left-1/2 top-[60%] h-0 w-0 cursor-grab touch-pan-y active:cursor-grabbing [transform-style:preserve-3d]"
        style={{ rotateY: rotationY, scale: ringScale }}
      >
        {ringItems.map(({ key, flag }, index) => {
          const angle = -ring.arcSpan / 2 + index * ring.step + 180
          return (
            <RingItem
              key={key}
              keyId={key}
              flag={flag}
              angle={angle}
              radius={ring.radius}
              rotationY={rotationY}
              onSelect={onSelect}
            />
          )
        })}
      </motion.div>
    </div>
  )
}
