"use client"

import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from "react"
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
import { ChevronDown, ChevronLeft, ChevronRight, Dices, SlidersHorizontal, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

const FLAG_COUNT = PRIDE_FLAGS.length

const BOOT_BAR_STAGGER_S = 0.052
const BOOT_BAR_DURATION_S = 0.5
const BOOT_HOLD_MS = 280
const BOOT_FADE_MS = 420

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

type BootPhase = "bars" | "fade" | "off"

function HomeV2BootOverlay({ phase, prideStripes }: { phase: BootPhase; prideStripes: readonly string[] }) {
  if (phase === "off") return null

  const barCount = Math.max(1, prideStripes.length)

  return (
    <motion.div
      className="fixed inset-0 z-[250] flex flex-col items-center justify-end bg-[oklch(0.07_0.02_290)] pb-[min(22vh,10rem)] sm:pb-[min(26vh,12rem)]"
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === "fade" ? 0 : 1 }}
      transition={{ duration: BOOT_FADE_MS / 1000, ease: [0.22, 1, 0.36, 1] }}
      aria-hidden
    >
      <div className="mb-10 flex items-end justify-center gap-1 sm:gap-1.5 md:gap-2" role="presentation">
        {prideStripes.map((hex, i) => (
          <motion.div
            key={`${hex}-${i}`}
            className="w-[clamp(5px,1.8vw,14px)] origin-bottom rounded-[1px]"
            style={{
              backgroundColor: hex,
              height: "clamp(5.5rem, 28vh, 14rem)",
              boxShadow: `0 0 26px color-mix(in srgb, ${hex} 40%, transparent)`,
            }}
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{
              delay: i * BOOT_BAR_STAGGER_S,
              duration: BOOT_BAR_DURATION_S,
              ease: [0.22, 1, 0.36, 1],
            }}
          />
        ))}
      </div>
      <motion.p
        className="font-display text-[0.65rem] font-bold uppercase tracking-[0.42em] text-muted-foreground"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: (barCount - 1) * BOOT_BAR_STAGGER_S + BOOT_BAR_DURATION_S * 0.35,
          duration: 0.4,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        Prism · loading signal
      </motion.p>
    </motion.div>
  )
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
  const [stripeGap, setStripeGap] = useState(0)
  const [cornerRadius, setCornerRadius] = useState(0)
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
      heroWrap: {
        hidden: {},
        show: {
          transition: reduceMotion ? {} : { staggerChildren: 0.14, delayChildren: 0.05 },
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

  const handleStageMove = (e: ReactMouseEvent<HTMLDivElement>) => {
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

  const welcomeFlag = useMemo(() => PRIDE_FLAGS.find((f) => f.id === "pride") ?? PRIDE_FLAGS[0], [])

  const [bootPhase, setBootPhase] = useState<BootPhase>("bars")

  const bootBarsDurationMs = useMemo(() => {
    const s = welcomeFlag.display.stripes ?? []
    const n = Math.max(1, s.length)
    return Math.ceil((n - 1) * BOOT_BAR_STAGGER_S * 1000 + BOOT_BAR_DURATION_S * 1000 + BOOT_HOLD_MS)
  }, [welcomeFlag])

  useLayoutEffect(() => {
    if (reduceMotion === true) setBootPhase("off")
  }, [reduceMotion])

  useEffect(() => {
    if (reduceMotion === true) return
    if (bootPhase !== "bars") return
    const t = window.setTimeout(() => setBootPhase("fade"), bootBarsDurationMs)
    return () => window.clearTimeout(t)
  }, [bootPhase, bootBarsDurationMs, reduceMotion])

  useEffect(() => {
    if (bootPhase !== "fade") return
    const t = window.setTimeout(() => setBootPhase("off"), BOOT_FADE_MS)
    return () => window.clearTimeout(t)
  }, [bootPhase])

  useEffect(() => {
    if (bootPhase === "off") return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBootPhase("off")
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [bootPhase])

  useEffect(() => {
    if (bootPhase === "off") return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [bootPhase])

  const frameRadiusStyle = useMemo((): CSSProperties | undefined => {
    if (cornerRadius <= 0) return undefined
    return { clipPath: "none", borderRadius: `${cornerRadius}px` }
  }, [cornerRadius])

  const studioShellStyle = useMemo((): CSSProperties | undefined => {
    if (cornerRadius <= 0) return undefined
    return { borderRadius: `${cornerRadius}px` }
  }, [cornerRadius])

  const scrollToFlagsSection = useCallback(
    (e: ReactMouseEvent<HTMLAnchorElement>) => {
      e.preventDefault()
      const el = document.getElementById("home-v2-main")
      if (!el) return
      el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" })
    },
    [reduceMotion]
  )

  const bootContentRevealed = reduceMotion === true || bootPhase !== "bars"

  return (
    <div className="home-v2-root text-foreground" aria-busy={bootPhase !== "off"}>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {bootPhase === "off" ? "Pride Guide ready." : "Starting Pride Guide, please wait."}
      </p>
      <div className="home-v2-grain" aria-hidden />
      {reduceMotion !== true && bootPhase !== "off" && (
        <HomeV2BootOverlay phase={bootPhase} prideStripes={welcomeFlag.display.stripes ?? []} />
      )}
      <div className="home-v2-stack">
        <a
          href="#home-v2-main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[260] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        >
          Skip to flags
        </a>

        <motion.section
          className="home-v2-hero"
          aria-label="Welcome"
          initial="hidden"
          animate={bootContentRevealed ? "show" : "hidden"}
          variants={variants.heroWrap}
        >
          <motion.div variants={variants.item} className="mx-auto flex max-w-6xl justify-end px-4 pt-6 sm:px-8 sm:pt-10">
            <ThemeToggle />
          </motion.div>

          <motion.div
            variants={variants.item}
            className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-14 pt-8 sm:px-8 sm:pb-16 sm:pt-10 lg:grid-cols-12 lg:gap-x-16 lg:pb-20 lg:pt-4"
          >
            <div className="space-y-8 lg:col-span-7">
              <div className="space-y-5">
                <div className="home-v2-kicker-rule" aria-hidden />
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.32em] text-primary">Prism · queer education</p>
                <h1 className="font-display text-[clamp(2.75rem,11vw,5.25rem)] font-black leading-[0.92] tracking-tight">
                  Pride
                  <br />
                  <span className="text-muted-foreground">Guide</span>
                </h1>
              </div>

              <div className="space-y-5">
                <p className="max-w-[40ch] text-pretty font-display text-[clamp(1.2rem,3.2vw,1.75rem)] font-bold leading-snug tracking-tight text-foreground">
                  Welcome in. You're about to go deep on the symbols that hold our stories—color, history, and meaning,
                  turned up loud.
                </p>
                <p className="max-w-[52ch] text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Learn on your own terms. No one owes you their identity as a lesson plan—and you still deserve to walk
                  away informed, fired up, and ready to show up for the community.
                </p>
              </div>

              <div>
                <a
                  href="#home-v2-main"
                  onClick={scrollToFlagsSection}
                  className="group inline-flex items-center gap-3 border-b-2 border-primary pb-1 font-display text-sm font-extrabold uppercase tracking-[0.2em] text-foreground transition-colors hover:border-foreground hover:text-primary"
                >
                  Start exploring
                  <span
                    className="inline-block transition-transform duration-300 ease-out group-hover:translate-y-1"
                    aria-hidden
                  >
                    ↓
                  </span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="mx-auto max-w-md lg:mx-0 lg:max-w-none">
                <p className="mb-4 text-center text-[0.65rem] font-bold uppercase tracking-[0.2em] text-muted-foreground lg:text-left text-balance">
                  The rhythm you'll feel below—pixel columns, true hues
                </p>
                <div className="home-v2-hero-preview" style={frameRadiusStyle}>
                  <div className="home-v2-hero-preview-inner overflow-hidden" style={frameRadiusStyle}>
                    <AnimatedFlag
                      backgroundColors={welcomeFlag.display.stripes ?? []}
                      svgForeground={welcomeFlag.display.svgForeground}
                      numOfColumns={22}
                      billow={0.75}
                      columnGapPx={stripeGap}
                      stripeCornerRadiusPx={cornerRadius}
                      className="w-full max-h-[min(28vh,220px)] min-h-[140px]"
                    />
                  </div>
                </div>
                <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground lg:text-left">
                  Every flag here uses accurate colors and respectful copy. The vibe is ours; the symbols belong to the
                  people they represent.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.section>

        <motion.main
          id="home-v2-main"
          className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-14"
          variants={variants.wrap}
          initial="hidden"
          animate={bootContentRevealed ? "show" : "hidden"}
        >
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
                  <div className="home-v2-stage-shell" style={frameRadiusStyle}>
                    <div className="home-v2-stage-inner overflow-hidden" style={frameRadiusStyle}>
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
                          columnGapPx={stripeGap}
                          stripeCornerRadiusPx={cornerRadius}
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
                      className={cn(
                        "group flex h-12 w-full max-w-md items-center justify-between border border-dashed border-foreground/20 bg-muted/20 px-4 text-left font-display text-sm font-bold tracking-tight hover:bg-muted/40",
                        cornerRadius <= 0 && "rounded-none"
                      )}
                      style={studioShellStyle}
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
                    <div
                      className="mt-4 space-y-5 border border-foreground/10 bg-card/30 p-5 sm:p-6"
                      style={studioShellStyle}
                    >
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

                      <div className="space-y-2 border-t border-border/50 pt-4">
                        <div className="flex items-center justify-between gap-3">
                          <Label
                            htmlFor="stripe-gap"
                            className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground"
                          >
                            Gap between stripes
                          </Label>
                          <span className="text-xs tabular-nums text-muted-foreground">{stripeGap}px</span>
                        </div>
                        <Slider
                          id="stripe-gap"
                          value={[stripeGap]}
                          onValueChange={(v) => setStripeGap(v[0] ?? 0)}
                          min={0}
                          max={16}
                          step={1}
                          aria-label="Gap between flag stripe columns in pixels"
                        />
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          Reveals space between slices. Flags with chevrons or overlays may show seams—set to zero for a
                          continuous look.
                        </p>
                      </div>

                      <div className="space-y-2 border-t border-border/50 pt-4">
                        <div className="flex items-center justify-between gap-3">
                          <Label
                            htmlFor="frame-radius"
                            className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground"
                          >
                            Rounded edges
                          </Label>
                          <span className="text-xs tabular-nums text-muted-foreground">{cornerRadius}px</span>
                        </div>
                        <Slider
                          id="frame-radius"
                          value={[cornerRadius]}
                          onValueChange={(v) => setCornerRadius(v[0] ?? 0)}
                          min={0}
                          max={28}
                          step={1}
                          aria-label="Border radius for flag frames, studio panel, and stripe ends"
                        />
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          Zero keeps the cut-corner frames; turn it up to round the hero preview, main stage, studio panel,
                          and stripe caps together.
                        </p>
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
