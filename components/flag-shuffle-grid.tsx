"use client"

import type { MouseEvent as ReactMouseEvent } from "react"
import { useLayoutEffect, useMemo, useRef } from "react"
import { useReducedMotion } from "framer-motion"
import Shuffle from "shufflejs"
import { FlagMosaicCard, type MosaicFlag } from "@/components/flag-mosaic-card"

type FlagShuffleGridProps<F extends MosaicFlag> = {
  flags: readonly F[]
  matchesFilter: (f: F) => boolean
  onSelect: (f: F, event: ReactMouseEvent<HTMLElement>) => void
}

/** Underscores = spaces in arbitrary calc (valid CSS). */
const itemWidth =
  "w-full min-w-0 sm:w-[calc((100%_-_20px)/2)] lg:w-[calc((100%_-_40px)/3)]"

/**
 * Masonry + filter transitions via [Shuffle.js](https://vestride.github.io/Shuffle/).
 * Framer layout/height-collapse is not used here, so parallax + float aren’t clipped.
 */
export function FlagShuffleGrid<F extends MosaicFlag>({
  flags,
  matchesFilter,
  onSelect,
}: FlagShuffleGridProps<F>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const shuffleRef = useRef<Shuffle | null>(null)
  const matchesRef = useRef(matchesFilter)
  const reduceMotion = useReducedMotion()

  matchesRef.current = matchesFilter

  const flagById = useMemo(() => new Map(flags.map((f) => [f.id, f] as const)), [flags])

  const applyFilter = (instance: Shuffle) => {
    instance.filter((element: HTMLElement) => {
      const id = element.dataset.flagId
      if (!id) return false
      const f = flagById.get(id)
      return f ? matchesRef.current(f) : false
    })
  }

  useLayoutEffect(() => {
    const root = containerRef.current
    if (!root) return

    const sizer = root.querySelector<HTMLElement>(".js-flag-shuffle-sizer")
    const shuffle = new Shuffle(root, {
      itemSelector: ".flag-shuffle-item",
      sizer: sizer ?? undefined,
      gutterWidth: 20,
      buffer: 12,
      staggerAmount: reduceMotion ? 0 : 18,
      staggerAmountMax: reduceMotion ? 0 : 120,
      speed: reduceMotion ? 0 : 300,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      roundTransforms: true,
    })

    shuffle.element.style.overflow = "visible"
    shuffleRef.current = shuffle
    applyFilter(shuffle)

    return () => {
      shuffle.destroy()
      shuffleRef.current = null
    }
  }, [flagById, reduceMotion])

  useLayoutEffect(() => {
    const instance = shuffleRef.current
    if (!instance) return
    matchesRef.current = matchesFilter
    applyFilter(instance)
  }, [matchesFilter, flagById])

  return (
    <div
      ref={containerRef}
      className="flag-shuffle-container relative w-full pt-10 lg:pt-14"
    >
      <div
        className={`js-flag-shuffle-sizer ${itemWidth} h-0 overflow-hidden p-0`}
        aria-hidden
      />
      {flags.map((flag, globalIndex) => (
        <div
          key={flag.id}
          className={`flag-shuffle-item ${itemWidth}`}
          data-flag-id={flag.id}
        >
          <FlagMosaicCard
            flag={flag}
            globalIndex={globalIndex}
            mosaicLayout={false}
            onSelect={onSelect}
          />
        </div>
      ))}
    </div>
  )
}
