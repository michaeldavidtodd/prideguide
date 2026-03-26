"use client"

import type { MouseEvent as ReactMouseEvent } from "react"
import { useRef } from "react"
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedFlag } from "@/components/animated-flag"
import { cn } from "@/lib/utils"

export interface MosaicFlagDisplay {
  stripes?: string[]
  svgForeground?: {
    viewBox: string
    paths: { id: string; d: string; fill: string; transform?: string; stroke?: string; strokeWidth?: string }[]
  }
}

export interface MosaicFlag {
  id: string
  name: string
  display: MosaicFlagDisplay
  description: string
  category: string
}

/**
 * 12-col mosaic: intentional ragged rows + horizontal nudges so the field feels scattered,
 * not a tight brick wall.
 */
const MOSAIC_LG: { span: string; start: string; mt: string; tx: string }[] = [
  { span: "lg:col-span-5", start: "lg:col-start-1", mt: "", tx: "lg:-translate-x-2" },
  { span: "lg:col-span-4", start: "lg:col-start-7", mt: "lg:mt-16", tx: "lg:translate-x-4" },
  { span: "lg:col-span-4", start: "lg:col-start-1", mt: "lg:mt-8", tx: "lg:translate-x-6" },
  { span: "lg:col-span-5", start: "lg:col-start-6", mt: "lg:-mt-6", tx: "lg:-translate-x-3" },
  { span: "lg:col-span-3", start: "lg:col-start-11", mt: "lg:mt-20", tx: "lg:translate-x-2" },
  { span: "lg:col-span-6", start: "lg:col-start-1", mt: "lg:mt-12", tx: "lg:-translate-x-4" },
  { span: "lg:col-span-4", start: "lg:col-start-8", mt: "lg:-mt-10", tx: "lg:translate-x-8" },
  { span: "lg:col-span-5", start: "lg:col-start-2", mt: "lg:mt-24", tx: "lg:-translate-x-1" },
  { span: "lg:col-span-6", start: "lg:col-start-7", mt: "lg:mt-6", tx: "lg:translate-x-3" },
]

const MOSAIC_SM = [
  "sm:col-span-3 sm:col-start-1 sm:translate-x-0",
  "sm:col-span-3 sm:col-start-4 sm:mt-12 sm:translate-x-2",
  "sm:col-span-3 sm:col-start-1 sm:mt-8 sm:-translate-x-1",
  "sm:col-span-3 sm:col-start-4 sm:-mt-4 sm:translate-x-3",
]

/** Depth: wider scale spread */
const SCALES = [1, 0.88, 1.12, 0.9, 1.08, 0.92, 1.06, 0.94, 1.1] as const

/** Per-card parallax strength (multiplies viewport-based shift) */
const PARALLAX_Y = [1.15, 0.75, 1.35, 0.9, 1.2, 0.65, 1.05, 0.85, 1.25] as const
const PARALLAX_X = [0.45, 0.7, 0.35, 0.55, 0.4, 0.8, 0.5, 0.6, 0.38] as const

/** Idle “hover in air” — vertical px peaks (staggered duration uses index) */
const FLOAT_Y_PEAK = [9, 13, 7, 11, 15, 8, 12, 10, 14] as const
const FLOAT_X_PEAK = [5, 4, 6, 3, 5, 7, 4, 6, 3] as const
const FLOAT_ROT = [0.9, 0.55, 1.1, 0.65, 0.75, 1, 0.5, 0.85, 0.7] as const

type FlagMosaicCardProps<F extends MosaicFlag> = {
  flag: F
  /** Index in the full flags list (mosaic placement + motion variety). */
  globalIndex: number
  /** When false (Shuffle.js grid), skip 12-col mosaic classes — layout is handled by the library. */
  mosaicLayout?: boolean
  onSelect: (flag: F, event: ReactMouseEvent<HTMLElement>) => void
}

export function FlagMosaicCard<F extends MosaicFlag>({
  flag,
  globalIndex,
  mosaicLayout = true,
  onSelect,
}: FlagMosaicCardProps<F>) {
  /** Never attach this to a node that also receives parallax `transform` — that couples scroll to layout and jitters. */
  const measureRef = useRef<HTMLDivElement>(null)
  const reduceMotion = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: measureRef,
    offset: ["start end", "end start"],
  })

  const patternIndex = globalIndex
  const fy = PARALLAX_Y[patternIndex % PARALLAX_Y.length]
  const fx = PARALLAX_X[patternIndex % PARALLAX_X.length]
  const xDir = patternIndex % 2 === 0 ? 1 : -1

  /** Progress 0→1 as the slot crosses the viewport; no DOM reads, no feedback with child transforms. */
  const yRaw = useTransform(scrollYProgress, (p) => {
    if (reduceMotion) return 0
    return (0.5 - p) * 110 * fy
  })

  const xRaw = useTransform(scrollYProgress, (p) => {
    if (reduceMotion) return 0
    return (p - 0.5) * 36 * fx * xDir
  })

  const accent = flag.display.stripes?.[0] ?? "hsl(var(--primary))"
  const shapeClass = patternIndex % 2 === 0 ? "rounded-2xl" : "rounded-md"
  const scale = reduceMotion ? 1 : SCALES[patternIndex % SCALES.length]

  const lg = MOSAIC_LG[globalIndex % MOSAIC_LG.length]
  const sm = MOSAIC_SM[globalIndex % MOSAIC_SM.length]

  const rot = reduceMotion ? 0 : patternIndex % 3 === 0 ? 1.25 : patternIndex % 3 === 1 ? -1.1 : 0.65

  const fyPeak = FLOAT_Y_PEAK[patternIndex % FLOAT_Y_PEAK.length]
  const fxPeak = FLOAT_X_PEAK[patternIndex % FLOAT_X_PEAK.length]
  const frPeak = FLOAT_ROT[patternIndex % FLOAT_ROT.length]
  const floatXSign = patternIndex % 2 === 0 ? 1 : -1

  const idleFloat = reduceMotion
    ? undefined
    : {
        y: [0, -fyPeak, -fyPeak * 0.35, -fyPeak * 0.85, 0],
        x: [0, fxPeak * floatXSign, 0, -fxPeak * 0.7 * floatXSign, 0],
        rotate: [0, frPeak, 0, -frPeak * 0.75, 0],
      }

  const idleTransition = reduceMotion
    ? undefined
    : {
        duration: 4.8 + (patternIndex % 6) * 0.45,
        repeat: Infinity,
        ease: [0.42, 0, 0.58, 1] as const,
        delay: (patternIndex % 13) * 0.28,
        repeatDelay: 0.15,
      }

  return (
    <div
      ref={measureRef}
      className={cn(
        mosaicLayout
          ? [
              "relative z-0 min-w-0 col-span-1 hover:z-20",
              sm,
              lg.span,
              lg.start,
              lg.mt,
              lg.tx,
            ]
          : "relative z-0 min-w-0 w-full hover:z-20"
      )}
    >
      <motion.div
        className="mosaic-parallax-tile relative h-full will-change-transform"
        style={{ y: yRaw, x: xRaw, scale, rotate: rot }}
      >
        <motion.div
          className="h-full"
          animate={reduceMotion ? false : idleFloat}
          transition={idleTransition}
          whileHover={
            reduceMotion
              ? undefined
              : { y: 0, x: 0, rotate: 0, transition: { type: "spring", stiffness: 380, damping: 28 } }
          }
        >
          <Card
            className={cn(
              "flag-container h-full cursor-pointer overflow-hidden border-2 border-foreground/10 bg-card/90 shadow-none transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-xl hover:border-foreground/25 lg:transition-transform",
              shapeClass
            )}
            style={{
              borderLeftWidth: 4,
              borderLeftColor: accent,
            }}
            onClick={(event) => onSelect(flag, event)}
          >
            <CardHeader className="space-y-3 pb-1 pt-6">
              <AnimatedFlag
                backgroundColors={flag.display.stripes || []}
                svgForeground={flag.display.svgForeground}
                className="h-24 shrink-0 overflow-hidden rounded-sm"
              />
              <h3 className="font-display text-lg font-bold leading-snug tracking-tight text-foreground md:text-xl md:leading-snug">
                {flag.name}
              </h3>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-base font-normal leading-relaxed text-muted-foreground">{flag.description}</p>
              <div className="mt-4 min-h-9 border-t border-border/40 pt-3">
                <Badge
                  variant="secondary"
                  className="inline-flex h-auto max-w-full flex-wrap items-center justify-center whitespace-normal break-words rounded-md px-2.5 py-1.5 text-center font-semibold uppercase leading-snug tracking-wider text-[0.6875rem] sm:justify-start sm:text-left"
                >
                  {flag.category}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  )
}
