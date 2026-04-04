"use client"

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ThemeToggle } from "@/components/theme-toggle"
import { AnimatedFlag } from "@/components/animated-flag"
import { PRIDE_FLAGS } from "@/lib/flags"
import { ArrowLeft, ChevronDown, ChevronLeft, ChevronRight, Dices, SlidersHorizontal, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const FLAG_COUNT = PRIDE_FLAGS.length

function clampIndex(i: number) {
  return ((i % FLAG_COUNT) + FLAG_COUNT) % FLAG_COUNT
}

function parseHex(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.trim().replace(/^#/, "")
  if (!h) return null
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h
  if (full.length !== 6) return null
  const n = Number.parseInt(full, 16)
  if (Number.isNaN(n)) return null
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

/** Average of stripe hexes — editorial accent only; flag rendering stays exact. */
function averageStripeAccent(stripes: string[]): string {
  const rgbs = stripes.map(parseHex).filter(Boolean) as { r: number; g: number; b: number }[]
  if (rgbs.length === 0) return "hsl(var(--primary))"
  const t = rgbs.reduce((a, b) => ({ r: a.r + b.r, g: a.g + b.g, b: a.b + b.b }), { r: 0, g: 0, b: 0 })
  const n = rgbs.length
  return `rgb(${Math.round(t.r / n)} ${Math.round(t.g / n)} ${Math.round(t.b / n)})`
}

function HomeV2FocusContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reduceMotion = useReducedMotion()
  const [index, setIndex] = useState(0)
  const [activeStripe, setActiveStripe] = useState<number | null>(null)
  const [waveBoost, setWaveBoost] = useState(false)
  const [columnCount, setColumnCount] = useState(18)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [studioOpen, setStudioOpen] = useState(false)
  const pointerStart = useRef<{ x: number } | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  const flag = PRIDE_FLAGS[index]
  const stripes = flag.display.stripes ?? []
  const stripeAccent = useMemo(() => averageStripeAccent(stripes), [stripes])

  const variants = useMemo(
    () => ({
      wrap: {
        hidden: {},
        show: {
          transition: reduceMotion ? {} : { staggerChildren: 0.09, delayChildren: 0.04 },
        },
      },
      item: {
        hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
        },
      },
      header: {
        hidden: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -12 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
        },
      },
    }),
    [reduceMotion]
  )

  const syncUrl = useCallback(
    (i: number) => {
      const id = PRIDE_FLAGS[i].id
      router.replace(`/home-v2?f=${id}`, { scroll: false })
    },
    [router]
  )

  const goToIndex = useCallback(
    (i: number) => {
      const next = clampIndex(i)
      setIndex(next)
      setActiveStripe(null)
      syncUrl(next)
    },
    [syncUrl]
  )

  useEffect(() => {
    const id = searchParams.get("f")
    if (!id) return
    const found = PRIDE_FLAGS.findIndex((f) => f.id === id)
    if (found >= 0) setIndex(found)
  }, [searchParams])

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)")
    const apply = () => setColumnCount(mq.matches ? 26 : 16)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  const next = useCallback(() => goToIndex(index + 1), [goToIndex, index])
  const prev = useCallback(() => goToIndex(index - 1), [goToIndex, index])

  const shuffle = useCallback(() => {
    if (FLAG_COUNT < 2) return
    let pick = Math.floor(Math.random() * FLAG_COUNT)
    if (pick === index) pick = (pick + 1) % FLAG_COUNT
    goToIndex(pick)
  }, [goToIndex, index])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target?.closest("button, input, textarea, select, [role='combobox'], [contenteditable='true']")) {
        return
      }
      if (e.key === "ArrowRight") {
        e.preventDefault()
        next()
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault()
        prev()
      }
      if (e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault()
        shuffle()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [next, prev, shuffle])

  const handleStageMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reduceMotion || !stageRef.current) return
    const rect = stageRef.current.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width - 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: ny * -6, y: nx * 9 })
  }

  const resetTilt = () => setTilt({ x: 0, y: 0 })

  const billow = waveBoost ? 1.35 : 0.85

  const stripeLabels = useMemo(() => {
    return stripes.map((hex, i) => ({ hex, index: i + 1 }))
  }, [stripes])

  return (
    <div className="home-v2-root text-foreground">
      <div className="home-v2-grain" aria-hidden />
      <div className="home-v2-stack">
        <a
          href="#home-v2-main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        >
          Skip to flag focus
        </a>

        <motion.header
          className="border-b border-foreground/10"
          initial="hidden"
          animate="show"
          variants={variants.header}
        >
          <div className="mx-auto flex max-w-6xl flex-wrap items-start justify-between gap-6 px-4 py-6 sm:px-8 sm:py-8">
            <div className="max-w-2xl space-y-4">
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-auto gap-2 px-3 py-1 text-muted-foreground hover:text-foreground"
                asChild
              >
                <Link href="/">
                  <ArrowLeft className="size-4 shrink-0" aria-hidden />
                  <span className="text-xs font-semibold uppercase tracking-[0.2em]">Classic guide</span>
                </Link>
              </Button>
              <div className="space-y-3">
                <div className="home-v2-kicker-rule" aria-hidden />
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.28em] text-muted-foreground">Prism · queer symbols</p>
                <div className="flex flex-wrap items-baseline gap-3">
                  <h1 className="font-display text-[clamp(1.75rem,5vw,3rem)] font-extrabold leading-[1.05] tracking-tight">
                    Focus
                  </h1>
                  <Badge
                    variant="outline"
                    className="rounded-none border-foreground/25 bg-background/60 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-[0.2em]"
                  >
                    Lab
                  </Badge>
                </div>
                <p className="max-w-[52ch] text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                  Self-directed learning that respects community time. One flag at full volume—history, color, and meaning
                  without asking anyone to perform their identity for you.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2 sm:pt-2">
              <ThemeToggle />
              <p className="hidden max-w-[14rem] text-right text-[0.65rem] leading-snug text-muted-foreground sm:block">
                Accurate colors and narratives. The frame is ours; the symbols belong to the communities they represent.
              </p>
            </div>
          </div>
        </motion.header>

        <motion.main
          id="home-v2-main"
          className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-14"
          variants={variants.wrap}
          initial="hidden"
          animate="show"
        >
          <motion.p
            variants={variants.item}
            className="mb-12 max-w-[68ch] font-display text-[clamp(1.15rem,2.8vw,1.65rem)] font-bold leading-snug tracking-tight text-foreground"
          >
            Visibility is a practice.{" "}
            <span className="font-normal text-muted-foreground">Read, remember, and carry it forward.</span>
          </motion.p>

          <motion.div
            variants={variants.item}
            className="grid gap-14 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:items-start lg:gap-x-16 lg:gap-y-10"
          >
            <div className="space-y-8">
              <div className="relative">
                <span
                  className="pointer-events-none absolute -left-2 top-0 select-none font-display text-[clamp(3.25rem,16vw,10rem)] font-black leading-none tracking-tighter text-foreground/[0.045] dark:text-foreground/[0.07]"
                  aria-hidden
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="relative space-y-5 pt-2 sm:pt-4">
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={flag.id}
                        initial={reduceMotion ? false : { opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? undefined : { opacity: 0, y: -10 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="max-w-[95%]"
                      >
                        <h2 className="font-display text-[clamp(1.85rem,5.5vw,3.75rem)] font-extrabold leading-[1.02] tracking-tight">
                          {flag.name}
                        </h2>
                      </motion.div>
                    </AnimatePresence>
                    <div className="flex flex-col items-end gap-1 text-right">
                      <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                        In rotation
                      </span>
                      <span className="font-mono text-sm tabular-nums text-muted-foreground">
                        {index + 1} — {FLAG_COUNT}
                      </span>
                    </div>
                  </div>
                  <Badge className="rounded-none border-transparent bg-foreground px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-background">
                    {flag.category}
                  </Badge>
                </div>
              </div>

              <div>
                <div
                  ref={stageRef}
                  className="flag-container relative cursor-grab touch-pan-y active:cursor-grabbing"
                  onMouseMove={handleStageMove}
                  onMouseLeave={resetTilt}
                  onPointerDown={(e) => {
                    pointerStart.current = { x: e.clientX }
                  }}
                  onPointerUp={(e) => {
                    if (!pointerStart.current) return
                    const dx = e.clientX - pointerStart.current.x
                    pointerStart.current = null
                    if (Math.abs(dx) < 52) return
                    if (dx > 0) prev()
                    else next()
                  }}
                  style={{ perspective: reduceMotion ? undefined : "1100px" }}
                >
                  <div className="home-v2-stage-shell">
                    <div className="home-v2-stage-inner overflow-hidden">
                      <motion.div
                        className="relative"
                        animate={reduceMotion ? {} : { rotateX: tilt.x, rotateY: tilt.y }}
                        transition={{ type: "spring", stiffness: 280, damping: 26 }}
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        {!reduceMotion && (
                          <motion.div
                            key={`scan-${flag.id}`}
                            className="pointer-events-none absolute inset-0 z-10"
                            initial={{ opacity: 0.5, x: "-35%" }}
                            animate={{ opacity: 0, x: "135%" }}
                            transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
                          >
                            <div className="h-full w-[28%] bg-gradient-to-r from-transparent via-[hsl(var(--foreground)/0.12)] to-transparent" />
                          </motion.div>
                        )}
                        <div
                          className="pointer-events-none absolute inset-0 z-[1] opacity-[0.06]"
                          style={{
                            backgroundImage: `repeating-linear-gradient(
                              90deg,
                              hsl(var(--foreground)) 0px,
                              hsl(var(--foreground)) 1px,
                              transparent 1px,
                              transparent 4px
                            )`,
                          }}
                          aria-hidden
                        />
                        <AnimatedFlag
                          backgroundColors={stripes}
                          svgForeground={flag.display.svgForeground}
                          numOfColumns={columnCount}
                          billow={billow}
                          className="w-full"
                        />
                      </motion.div>
                    </div>
                  </div>
                  <p className="mt-4 max-w-xl text-xs leading-relaxed text-muted-foreground">
                    Hover to still the wave. Drag or swipe horizontally to change flags—same respect for the symbol, new
                    rhythm for your attention.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={prev}
                  aria-label="Previous flag"
                  className="size-12 rounded-none border-2 border-foreground/20 bg-background/80 shadow-none transition-colors hover:border-foreground/50 hover:bg-muted/50"
                >
                  <ChevronLeft className="size-6" />
                </Button>
                <Button
                  type="button"
                  onClick={shuffle}
                  className="h-12 gap-2 rounded-none border-2 border-transparent bg-foreground px-6 text-base font-bold tracking-tight text-background shadow-none hover:bg-foreground/90"
                >
                  <Dices className="size-5" aria-hidden />
                  Draw another
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={next}
                  aria-label="Next flag"
                  className="size-12 rounded-none border-2 border-foreground/20 bg-background/80 shadow-none transition-colors hover:border-foreground/50 hover:bg-muted/50"
                >
                  <ChevronRight className="size-6" />
                </Button>
              </div>

              <div>
                <Collapsible open={studioOpen} onOpenChange={setStudioOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="group flex h-12 w-full max-w-md items-center justify-between rounded-none border border-dashed border-foreground/20 bg-muted/20 px-4 text-left font-display text-sm font-bold tracking-tight hover:bg-muted/40"
                      aria-expanded={studioOpen}
                    >
                      <span className="inline-flex items-center gap-2">
                        <SlidersHorizontal className="size-4 opacity-70" aria-hidden />
                        Studio controls
                      </span>
                      <ChevronDown
                        className={cn("size-4 transition-transform duration-300", studioOpen && "rotate-180")}
                        aria-hidden
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                    <div className="mt-4 space-y-5 border border-foreground/10 bg-card/30 p-5 sm:p-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Label
                          htmlFor="jump-flag"
                          className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground"
                        >
                          Jump to
                        </Label>
                        <Select value={flag.id} onValueChange={(id) => goToIndex(PRIDE_FLAGS.findIndex((f) => f.id === id))}>
                          <SelectTrigger id="jump-flag" className="w-full rounded-none border-foreground/15 sm:max-w-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PRIDE_FLAGS.map((f) => (
                              <SelectItem key={f.id} value={f.id}>
                                {f.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                          <Label className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                            Slice resolution
                          </Label>
                          <span className="text-xs tabular-nums text-muted-foreground">{columnCount} columns</span>
                        </div>
                        <Slider
                          value={[columnCount]}
                          onValueChange={(v) => setColumnCount(v[0] ?? 18)}
                          min={10}
                          max={32}
                          step={1}
                          aria-label="Adjust pixel column count for the flag animation"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-4">
                        <div className="flex items-center gap-2">
                          <Sparkles className="size-4 text-primary" aria-hidden />
                          <Label htmlFor="wave-boost" className="text-sm font-semibold">
                            Amp the wave
                          </Label>
                        </div>
                        <Switch id="wave-boost" checked={waveBoost} onCheckedChange={setWaveBoost} />
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            </div>

            <div className="flex flex-col gap-12 lg:pt-6">
              <blockquote className="relative border-none p-0">
                <div
                  className="border-l-[5px] pl-6"
                  style={{ borderLeftColor: stripeAccent }}
                >
                  <p className="font-display text-[0.7rem] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                    Why it matters
                  </p>
                  <p className="mt-3 text-pretty text-[clamp(1.05rem,2.2vw,1.25rem)] font-medium leading-relaxed text-foreground">
                    {flag.significance}
                  </p>
                </div>
              </blockquote>

              <section aria-label="Flag details">
                <Accordion type="single" collapsible defaultValue="overview" className="border border-foreground/10 bg-background/40">
                  <AccordionItem value="overview" className="border-foreground/10 px-1 sm:px-2">
                    <AccordionTrigger className="home-v2-accordion-trigger px-4 py-5 font-display text-lg font-bold hover:no-underline sm:text-xl">
                      At a glance
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-6 text-base leading-relaxed text-muted-foreground">
                      {flag.description}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="history" className="border-foreground/10 px-1 sm:px-2">
                    <AccordionTrigger className="home-v2-accordion-trigger px-4 py-5 font-display text-lg font-bold hover:no-underline sm:text-xl">
                      History & context
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-6 text-base leading-relaxed text-muted-foreground">
                      {flag.history}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="significance" className="border-foreground/10 px-1 sm:px-2">
                    <AccordionTrigger className="home-v2-accordion-trigger px-4 py-5 font-display text-lg font-bold hover:no-underline sm:text-xl">
                      Full significance
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-6 text-base leading-relaxed text-muted-foreground">
                      {flag.significance}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </section>

              <section aria-labelledby="stripe-explorer-heading">
                <h3 id="stripe-explorer-heading" className="font-display text-xl font-bold tracking-tight">
                  Read the stripes
                </h3>
                <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
                  Each band is exact hex from the source design. Tap to inspect—no reinterpretation, just the colors as
                  specified.
                </p>
                <div
                  className="mt-5 flex gap-px overflow-hidden rounded-sm border border-foreground/15 bg-foreground/15 shadow-sm"
                  role="list"
                  aria-label="Flag color stripes"
                >
                  {stripeLabels.map(({ hex, index: stripeIndex }) => {
                    const active = activeStripe === stripeIndex
                    return (
                      <button
                        key={`${flag.id}-${stripeIndex}-${hex}`}
                        type="button"
                        role="listitem"
                        className={cn(
                          "home-v2-stripe-cut relative min-h-14 flex-1 transition-[flex,transform] duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                          active ? "z-[1] flex-[1.4] ring-2 ring-inset ring-foreground" : "hover:flex-[1.15] hover:brightness-105"
                        )}
                        style={{ backgroundColor: hex }}
                        onClick={() => setActiveStripe(active ? null : stripeIndex)}
                        aria-pressed={active}
                        aria-label={`Stripe ${stripeIndex}, color ${hex}`}
                      >
                        <span className="sr-only">
                          Stripe {stripeIndex} {hex}
                        </span>
                      </button>
                    )
                  })}
                </div>
                {activeStripe !== null && stripes[activeStripe - 1] && (
                  <p className="mt-3 font-mono text-sm text-foreground">
                    Band {activeStripe} · {stripes[activeStripe - 1]?.toUpperCase()}
                  </p>
                )}
              </section>

              <footer className="border-t border-foreground/10 pt-8">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-muted-foreground">Shortcuts</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  <kbd className="rounded-sm border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">←</kbd>{" "}
                  <kbd className="rounded-sm border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">→</kbd>{" "}
                  change flag ·{" "}
                  <kbd className="rounded-sm border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">↓</kbd> or{" "}
                  <kbd className="rounded-sm border border-border bg-muted px-1.5 py-0.5 font-mono text-xs">space</kbd>{" "}
                  random
                </p>
              </footer>
            </div>
          </motion.div>
        </motion.main>
      </div>
    </div>
  )
}

function HomeV2Fallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
      <p className="text-sm">Loading focus…</p>
    </div>
  )
}

export default function HomeV2Page() {
  return (
    <Suspense fallback={<HomeV2Fallback />}>
      <HomeV2FocusContent />
    </Suspense>
  )
}
