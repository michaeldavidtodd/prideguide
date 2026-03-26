"use client"

import type { MouseEvent as ReactMouseEvent } from "react"
import { useMemo } from "react"
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

export function FlagRingCarousel<F extends RingFlag>({ flags, onSelect }: FlagRingCarouselProps<F>) {
  const shouldReduceMotion = useReducedMotion()

  const tickerItems = useMemo(() => {
    if (flags.length === 0) return [] as { key: string; flag: F }[]

    return flags.map((flag, index) => ({ key: `${flag.id}-${index}`, flag }))
  }, [flags])

  const loopItems = useMemo(() => [...tickerItems, ...tickerItems], [tickerItems])

  return (
    <div className="relative h-fit min-h-[20rem] max-h-[34rem] w-full">
      <div
        className={`flag-ticker-track absolute left-0 top-[58%] flex w-max -translate-y-1/2 ${
          shouldReduceMotion ? "flag-ticker-track--reduced" : ""
        }`}
      >
        {loopItems.map(({ key, flag }, index) => {
          const baseIndex = index % tickerItems.length
          const seed = Array.from(flag.id).reduce((acc, char) => acc + char.charCodeAt(0), 0)
          const bobDelay = -((baseIndex * 0.41) + (seed % 7) * 0.13)
          const bobDuration = 4.8 + ((baseIndex * 3 + seed) % 10) * 0.38
          const bobAmplitude = 28 + ((baseIndex * 5 + seed) % 8) * 8
          const bobTilt = (baseIndex % 2 === 0 ? 1 : -1) * (0.8 + ((seed + baseIndex) % 6) * 0.28)
          const bobName = baseIndex % 3 === 0 ? "tickerBobAlt" : "tickerBob"
          return (
            <button
              key={`${key}-loop-${index}`}
              type="button"
              onClick={(event) => onSelect(flag, event)}
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
    </div>
  )
}
