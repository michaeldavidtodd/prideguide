"use client"

import type { MouseEvent as ReactMouseEvent } from "react"
import type { CSSProperties } from "react"
import { useLayoutEffect, useMemo, useRef, useState } from "react"
import { useReducedMotion } from "framer-motion"
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

/** How many identical strips sit side-by-side (≥2). More = longer ribbon; loop length = one strip width. */
const STRIP_COUNT = 4

const LOOP_MS = 40_000
const LOOP_MS_REDUCED = 120_000

function wrapX(x: number, loop: number): number {
  if (loop <= 0) return x
  let v = x
  while (v <= -loop) v += loop
  while (v > 0) v -= loop
  return v
}

export function FlagRingCarousel<F extends RingFlag>({ flags, onSelect }: FlagRingCarouselProps<F>) {
  const prefersReducedMotion = useReducedMotion()
  const trackRef = useRef<HTMLDivElement | null>(null)
  const segmentRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<{ pointerId: number | null; startX: number; dragStartOffset: number; moved: boolean }>({
    pointerId: null,
    startX: 0,
    dragStartOffset: 0,
    moved: false,
  })
  const xRef = useRef(0)
  const dragXRef = useRef(0)
  const loopPxRef = useRef(0)
  const lastTRef = useRef<number | null>(null)
  const draggingRef = useRef(false)
  const reducedRef = useRef(false)

  const [isDragging, setIsDragging] = useState(false)

  reducedRef.current = prefersReducedMotion === true

  const tickerItems = useMemo(() => {
    if (flags.length === 0) return [] as { key: string; flag: F }[]

    return flags.map((flag, index) => ({ key: `${flag.id}-${index}`, flag }))
  }, [flags])

  useLayoutEffect(() => {
    const el = segmentRef.current
    if (!el || tickerItems.length === 0) {
      loopPxRef.current = 0
      return
    }
    const measure = () => {
      const w = el.offsetWidth
      loopPxRef.current = w > 0 ? w : 0
    }
    measure()
    requestAnimationFrame(measure)
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [tickerItems])

  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return

    let id = 0
    const tick = (now: number) => {
      const loop = loopPxRef.current
      const period = reducedRef.current ? LOOP_MS_REDUCED : LOOP_MS
      const last = lastTRef.current ?? now
      lastTRef.current = now
      const dt = Math.min(now - last, 80)

      if (loop > 0 && !draggingRef.current) {
        xRef.current -= (loop / period) * dt
        xRef.current = wrapX(xRef.current, loop)
      }

      track.style.transform = `translateX(${xRef.current + dragXRef.current}px)`
      id = requestAnimationFrame(tick)
    }

    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [])

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!trackRef.current) return
    dragRef.current.pointerId = event.pointerId
    dragRef.current.startX = event.clientX
    dragRef.current.dragStartOffset = dragXRef.current
    dragRef.current.moved = false
    draggingRef.current = true
    setIsDragging(true)
    lastTRef.current = performance.now()
  }

  const onDragMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current.pointerId !== event.pointerId) return
    const deltaX = event.clientX - dragRef.current.startX
    if (Math.abs(deltaX) > 6) dragRef.current.moved = true
    dragXRef.current = dragRef.current.dragStartOffset + deltaX
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${xRef.current + dragXRef.current}px)`
    }
  }

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragRef.current.pointerId !== event.pointerId) return
    dragRef.current.pointerId = null
    draggingRef.current = false
    setIsDragging(false)

    const loop = loopPxRef.current
    xRef.current += dragXRef.current
    dragXRef.current = 0
    xRef.current = wrapX(xRef.current, loop)
    lastTRef.current = performance.now()

    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(${xRef.current}px)`
    }

    window.setTimeout(() => {
      dragRef.current.moved = false
    }, 0)
  }

  const renderStrip = (stripIndex: number) => (
    <div
      key={`strip-${stripIndex}`}
      ref={stripIndex === 0 ? segmentRef : undefined}
      className="flex w-max shrink-0"
    >
      {tickerItems.map(({ key, flag }, baseIndex) => {
        const seed = Array.from(flag.id).reduce((acc, char) => acc + char.charCodeAt(0), 0)
        const bobDelay = -((baseIndex * 0.41) + (seed % 7) * 0.13)
        const bobDuration = 4.8 + ((baseIndex * 3 + seed) % 10) * 0.38
        const bobAmplitude = 28 + ((baseIndex * 5 + seed) % 8) * 8
        const bobTilt = (baseIndex % 2 === 0 ? 1 : -1) * (0.8 + ((seed + baseIndex) % 6) * 0.28)
        const bobName = baseIndex % 3 === 0 ? "tickerBobAlt" : "tickerBob"
        return (
          <button
            key={`${key}-s${stripIndex}`}
            type="button"
            onClick={(event) => {
              if (dragRef.current.moved) {
                event.preventDefault()
                event.stopPropagation()
                return
              }
              onSelect(flag, event)
            }}
            className="group mx-3 w-[52vw] min-w-[12rem] max-w-[20rem] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:mx-4 sm:w-[24rem] sm:max-w-[24rem]"
            aria-label={`Open details for ${flag.name}`}
          >
            <div
              className="flag-ticker-card-bob"
              style={{
                ["--bob-amp" as string]: `${bobAmplitude}px`,
                ["--bob-tilt" as string]: `${bobTilt}deg`,
                animationName: bobName,
                animationDelay: `${bobDelay}s`,
                animationDuration: `${bobDuration}s`,
              }}
            >
              <AnimatedFlag
                backgroundColors={flag.display.stripes || []}
                svgForeground={flag.display.svgForeground}
                className="h-36 w-full rounded-md sm:h-56"
              />
              <p className="mt-2 text-sm font-semibold leading-tight tracking-tight sm:text-xl">{flag.name}</p>
            </div>
          </button>
        )
      })}
    </div>
  )

  return (
    <div className="relative h-fit min-h-[20rem] max-h-[34rem] w-full">
      <div className="absolute left-0 top-[58%] w-max -translate-y-1/2">
        <div
          ref={trackRef}
          className={`flex w-max will-change-transform ${isDragging ? "cursor-grabbing" : "cursor-grab"}`}
          style={
            {
              touchAction: "pan-y",
            } as CSSProperties
          }
          onPointerDown={startDrag}
          onPointerMove={onDragMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {Array.from({ length: STRIP_COUNT }, (_, i) => renderStrip(i))}
        </div>
      </div>
    </div>
  )
}
