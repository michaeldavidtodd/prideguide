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

const MIN_RING_ITEMS = 12

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
    const cosValue = Math.cos((normalized * Math.PI) / 180)
    // Smoothly fade cards in/out around the front/back seam to avoid snap-jumps.
    return Math.max(0, Math.min(1, (-cosValue + 0.08) / 0.22))
  })
  const zIndex = useTransform(rotationY, (value) => {
    const absoluteAngle = angle + value
    const normalized = ((((absoluteAngle % 360) + 360) % 360) + 180) % 360 - 180
    const cosValue = Math.cos((normalized * Math.PI) / 180)
    // For the visible back-half (cos < 0), center (cos = -1) should be top-most.
    const depth = (-cosValue + 1) / 2
    return Math.round((depth + 1) * 1200)
  })
  const pointerEvents = useTransform(opacity, (value) => (value > 0.85 ? "auto" : "none"))

  return (
    <motion.div
      key={keyId}
      className="absolute left-1/2 -top-[13.5rem] w-[28rem] min-w-[8.5rem] max-w-[32vw] sm:max-w-[28rem] [backface-visibility:hidden] [transform-style:preserve-3d] [contain:layout_paint_style] [will-change:transform,opacity]"
      style={{
        transform: `translateX(-50%) rotateY(${angle}deg) translateZ(${radius}px) rotateY(180deg)`,
        zIndex,
        opacity,
        pointerEvents,
      }}
    >
      <button
        type="button"
        onClick={(event) => onSelect(flag, event)}
        className="group w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ transform: "scale(0.86)" }}
        aria-label={`Open details for ${flag.name}`}
      >
        <AnimatedFlag
          backgroundColors={flag.display.stripes || []}
          svgForeground={flag.display.svgForeground}
          className="h-64 w-full overflow-hidden"
        />
        <p className="mt-4 text-xl font-semibold tracking-tight leading-none sm:text-3xl">{flag.name}</p>
      </button>
    </motion.div>
  )
}

export function FlagRingCarousel<F extends RingFlag>({ flags, onSelect }: FlagRingCarouselProps<F>) {
  const [isLowPowerMode, setIsLowPowerMode] = useState(false)
  const [viewportWidth, setViewportWidth] = useState(1280)
  const rotationY = useMotionValue(0)
  const targetRotationRef = useRef(0)
  const currentRotationRef = useRef(0)
  const isDraggingRef = useRef(false)
  const lastFrameTimeRef = useRef(0)
  const shouldReduceMotion = useReducedMotion()
  const isMobile = viewportWidth < 768
  const autoRotateSpeed = isLowPowerMode ? 0.0026 : 0.0036
  const dragSensitivity = isLowPowerMode ? 0.24 : 0.32
  const ringScale = isMobile ? 1.44 : isLowPowerMode ? 1.45 : 1.8

  useEffect(() => {
    const updateViewport = () => {
      const width = window.innerWidth
      setViewportWidth(width)
      const cores = navigator.hardwareConcurrency ?? 8
      const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8
      setIsLowPowerMode(width < 900 || cores <= 6 || memory <= 4)
    }

    updateViewport()
    window.addEventListener("resize", updateViewport)
    return () => {
      window.removeEventListener("resize", updateViewport)
    }
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

    const targetCount = Math.max(flags.length, MIN_RING_ITEMS)
    const items: { key: string; flag: F }[] = []
    for (let index = 0; index < targetCount; index += 1) {
      const flag = flags[index % flags.length]
      items.push({ key: `${flag.id}-${index}`, flag })
    }

    return items
  }, [flags])

  const ringIdentity = useMemo(() => ringItems.map((item) => item.flag.id).join("|"), [ringItems])

  useEffect(() => {
    targetRotationRef.current = 0
    currentRotationRef.current = 0
    rotationY.set(0)
    lastFrameTimeRef.current = 0
  }, [rotationY, ringItems.length, ringIdentity])

  const ring = useMemo(() => {
    const count = Math.max(ringItems.length, 1)
    const arcSpan = 360
    const step = arcSpan / count
    const radius = isMobile
      ? (() => {
          const cardWidthPx = Math.max(136, Math.min(448, viewportWidth * 0.32))
          const widthScale = cardWidthPx / 448
          const baseRadius = isLowPowerMode ? count * 52 : count * 65
          const scaledRadius = baseRadius * widthScale
          const effectiveCardWidthPx = cardWidthPx * 0.86 * ringScale
          const stepRadians = (step * Math.PI) / 180
          const desiredChord = effectiveCardWidthPx * 0.86
          const geometricRadius = desiredChord / (2 * Math.sin(Math.max(0.08, stepRadians / 2)))
          const scaledMinRadius = Math.max(150, (isLowPowerMode ? 320 : 420) * widthScale)
          const scaledMaxRadius = Math.max(500, (isLowPowerMode ? 1200 : 1800) * widthScale)
          const computedRadius = Math.max(scaledMinRadius, Math.min(scaledMaxRadius, scaledRadius))
          return Math.max(computedRadius, geometricRadius)
        })()
      : isLowPowerMode
        ? Math.max(700, Math.min(1200, count * 52))
        : Math.max(900, Math.min(1800, count * 65))
    return { step, radius, arcSpan }
  }, [ringItems.length, isLowPowerMode, viewportWidth, isMobile])

  return (
    <div className="relative h-[60vh] min-h-[30rem] max-h-[52rem] w-full overflow-hidden sm:h-[58vh] sm:min-h-[28rem] [perspective:2600px]">
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
        className="absolute left-1/2 top-[58%] h-0 w-0 cursor-grab touch-pan-y active:cursor-grabbing sm:top-[60%] [transform-style:preserve-3d] [will-change:transform]"
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
