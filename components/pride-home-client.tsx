"use client"

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
} from "react"
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
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { ThemeToggle } from "@/components/theme-toggle"
import { AnimatedFlag } from "@/components/animated-flag"
import {
  canonicalFlagHex,
  collectFlagPalette,
  PRIDE_FLAGS,
  type FlagPaletteSwatch,
} from "@/lib/flags"
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Dices,
  Heart,
  House,
  Info,
  Menu,
  Palette,
  SlidersHorizontal,
  Sparkles,
  Trophy,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  PRIDE_ABOUT_APP_PATH,
  PRIDE_ALLY_PATH,
  PRIDE_CLASSIC_PATH,
  PRIDE_EXPLORE_PATH,
  PRIDE_QUIZ_PATH,
} from "@/lib/pride-routes"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/** @deprecated Use PRIDE_EXPLORE_PATH from @/lib/pride-routes */
export const HOME_V2_EXPLORE_PATH = PRIDE_EXPLORE_PATH

const FLAG_COUNT = PRIDE_FLAGS.length

const LS_EXPLORE_MOTION = "prideguide-explore-motion-pref"
const LS_EXPLORE_STUDIO_PERSIST = "prideguide-explore-studio-persist"
const LS_EXPLORE_STUDIO = "prideguide-explore-studio-v1"

type ExploreMotionPreference = "system" | "reduce" | "full"

type ExploreStudioSnapshot = {
  columnCount: number
  waveBoost: boolean
  stripeGap: number
  cornerRadius: number
}

function clampInt(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(n)))
}

function randomExploreStudioSnapshot(): ExploreStudioSnapshot {
  return {
    columnCount: 10 + Math.floor(Math.random() * 23),
    waveBoost: Math.random() < 0.5,
    stripeGap: Math.floor(Math.random() * 17),
    cornerRadius: Math.floor(Math.random() * 29),
  }
}

function parseExploreStudioSnapshot(raw: unknown): ExploreStudioSnapshot | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  const columnCount =
    typeof o.columnCount === "number" ? clampInt(o.columnCount, 10, 32) : null
  const stripeGap = typeof o.stripeGap === "number" ? clampInt(o.stripeGap, 0, 16) : null
  const cornerRadius =
    typeof o.cornerRadius === "number" ? clampInt(o.cornerRadius, 0, 28) : null
  const waveBoost = typeof o.waveBoost === "boolean" ? o.waveBoost : null
  if (columnCount === null || stripeGap === null || cornerRadius === null || waveBoost === null) {
    return null
  }
  return { columnCount, waveBoost, stripeGap, cornerRadius }
}

/* ---- Aurora BG: soft color blobs cycling through flag palettes ---- */
const AURORA_CYCLE_MS = 5000
const AURORA_FLAG_IDS = [
  "pride", "transgender", "bisexual", "lesbian",
  "nonbinary", "pansexual", "gay", "progress",
]

function FlagAurora({ reduceMotion }: { reduceMotion: boolean | null }) {
  const [idx, setIdx] = useState(0)

  const auroraFlags = useMemo(() => {
    const map = new Map(PRIDE_FLAGS.map((f) => [f.id, f]))
    return AURORA_FLAG_IDS.map((id) => map.get(id)).filter(Boolean) as PrideFlag[]
  }, [])

  useEffect(() => {
    if (reduceMotion === true || auroraFlags.length < 2) return
    const t = window.setInterval(() => {
      setIdx((prev) => (prev + 1) % auroraFlags.length)
    }, AURORA_CYCLE_MS)
    return () => window.clearInterval(t)
  }, [reduceMotion, auroraFlags.length])

  const flag = auroraFlags[idx]
  const stripes = flag?.display.stripes ?? []

  const blob1 = stripes[0] ?? "hsl(var(--primary))"
  const blob2 = stripes[Math.floor(stripes.length / 2)] ?? "hsl(var(--accent))"
  const blob3 = stripes[stripes.length - 1] ?? "hsl(var(--secondary))"

  return (
    <div className="home-v2-aurora" aria-hidden>
      <div
        className="home-v2-aurora-blob home-v2-aurora-blob--1"
        style={{ background: blob1 }}
      />
      <div
        className="home-v2-aurora-blob home-v2-aurora-blob--2"
        style={{ background: blob2 }}
      />
      <div
        className="home-v2-aurora-blob home-v2-aurora-blob--3"
        style={{ background: blob3 }}
      />
    </div>
  )
}

const BOOT_BAR_STAGGER_S = 0.052
const BOOT_BAR_DURATION_S = 0.5
const BOOT_HOLD_MS = 280
const BOOT_FADE_MS = 420

function clampIndex(i: number) {
  return ((i % FLAG_COUNT) + FLAG_COUNT) % FLAG_COUNT
}

/** Shortest path around the ring — drives slide direction for jumps (shuffle, URL, studio). */
function indexDeltaDir(from: number, to: number): 1 | -1 {
  if (from === to) return 1
  const forward = (to - from + FLAG_COUNT) % FLAG_COUNT
  const backward = (from - to + FLAG_COUNT) % FLAG_COUNT
  return forward <= backward ? 1 : -1
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

type PrideFlag = (typeof PRIDE_FLAGS)[number]

function HomeV2AboutBlock({
  flag,
  stripeAccent,
  className,
}: {
  flag: PrideFlag
  stripeAccent: string
  className?: string
}) {
  return (
    <div className={cn("space-y-0", className)}>
      <blockquote className="relative mb-6 border-none p-0 lg:mb-5">
        <div className="border-l-[5px] pl-4 lg:pl-5" style={{ borderLeftColor: stripeAccent }}>
          <p className="font-display text-[0.6rem] font-bold uppercase tracking-[0.2em] text-muted-foreground lg:text-[0.65rem]">
            Why it matters
          </p>
          <p className="mt-2 text-balance text-sm font-medium leading-relaxed text-foreground sm:text-base">{flag.significance}</p>
        </div>
      </blockquote>
      <Accordion type="single" collapsible defaultValue="overview" className="border border-foreground/10 bg-background/40">
        <AccordionItem value="overview" className="border-foreground/10 px-1">
          <AccordionTrigger className="home-v2-accordion-trigger px-3 py-3 font-display text-sm font-bold hover:no-underline sm:py-4 sm:text-base">
            At a glance
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3 text-xs leading-relaxed text-muted-foreground sm:pb-4 sm:text-sm">
            {flag.description}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="history" className="border-foreground/10 px-1">
          <AccordionTrigger className="home-v2-accordion-trigger px-3 py-3 font-display text-sm font-bold hover:no-underline sm:py-4 sm:text-base">
            History & context
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3 text-xs leading-relaxed text-muted-foreground sm:pb-4 sm:text-sm">
            {flag.history}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="significance" className="border-foreground/10 px-1">
          <AccordionTrigger className="home-v2-accordion-trigger px-3 py-3 font-display text-sm font-bold hover:no-underline sm:py-4 sm:text-base">
            Full significance
          </AccordionTrigger>
          <AccordionContent className="px-3 pb-3 text-xs leading-relaxed text-muted-foreground sm:pb-4 sm:text-sm">
            {flag.significance}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

const exploreKbd =
  "inline-flex min-h-9 min-w-9 shrink-0 items-center justify-center rounded-md border border-foreground/20 bg-muted/90 px-2 font-mono text-sm font-semibold text-foreground shadow-[inset_0_1px_0_hsl(var(--background)/0.4)] sm:min-h-10 sm:min-w-10 sm:text-base"

function ExploreKeyboardLegend({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-2.5", className)} role="region" aria-label="Keyboard shortcuts">
      {/* <p className="font-display text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">Keys</p> */}
      <dl className="space-y-2 text-sm leading-snug sm:text-[0.9375rem] sm:leading-snug">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
          <dt className="sr-only">Previous and next</dt>
          <dd className="flex flex-wrap items-center gap-2 text-foreground">
            <kbd className={exploreKbd} aria-label="Left arrow">
              <ArrowLeft className="size-5 sm:size-6" aria-hidden strokeWidth={2.25} />
            </kbd>
            <kbd className={exploreKbd} aria-label="Right arrow">
              <ArrowRight className="size-5 sm:size-6" aria-hidden strokeWidth={2.25} />
            </kbd>
            <span className="text-muted-foreground">Previous or next flag</span>
          </dd>
        </div>
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
          <dt className="sr-only">Random flag</dt>
          <dd className="flex flex-wrap items-center gap-2 text-foreground">
            <kbd className={exploreKbd} aria-label="Down arrow">
              <ArrowDown className="size-5 sm:size-6" aria-hidden strokeWidth={2.25} />
            </kbd>
            <span className="text-muted-foreground">or</span>
            <kbd className={cn(exploreKbd, "min-w-[4.75rem] px-3")} aria-label="Space bar">
              Space
            </kbd>
            <span className="text-muted-foreground">Random flag</span>
          </dd>
        </div>
      </dl>
    </div>
  )
}

function HomeV2StripePaletteStrip({
  flagId,
  palette,
  activeStripe,
  onStripeToggle,
  variant,
}: {
  flagId: string
  palette: FlagPaletteSwatch[]
  activeStripe: number | null
  onStripeToggle: (swatchIndex: number) => void
  variant: "rail" | "drawer"
}) {
  const minH = variant === "rail" ? "min-h-11" : "min-h-16"
  const activeSwatch = activeStripe !== null ? palette.find((s) => s.index === activeStripe) : undefined
  return (
    <div className="space-y-2">
      {variant === "rail" && (
        <div>
          <p className="font-display text-[0.6rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">Flag colors</p>
          <p className="mt-1 text-[0.65rem] leading-snug text-muted-foreground">
            Tap a swatch for hex and what that color represents.
          </p>
        </div>
      )}
      <div
        className="flex gap-1 overflow-hidden rounded-sm shadow-sm"
        role="list"
        aria-label="Flag color palette"
      >
        {palette.map(({ hex, index: swatchIndex, label, meaning }) => {
          const active = activeStripe === swatchIndex
          const title =
            meaning !== undefined && meaning.length > 0
              ? `${label} — ${meaning} · ${hex}`
              : `${label} · ${hex}`
          const a11yLabel =
            meaning !== undefined && meaning.length > 0
              ? `${label}, ${meaning}, color ${hex}`
              : `${label}, color ${hex}`
          return (
            <button
              key={`${flagId}-${swatchIndex}-${hex}`}
              type="button"
              role="listitem"
              title={title}
              className={cn(
                "home-v2-stripe-cut relative flex-1 transition-[flex,transform] duration-200 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                minH,
                active ? "z-[1] flex-[1.35] ring-2 ring-inset ring-foreground" : "hover:flex-[1.12] hover:brightness-105"
              )}
              style={{ backgroundColor: hex }}
              onClick={() => onStripeToggle(swatchIndex)}
              aria-pressed={active}
              aria-label={a11yLabel}
            >
              <span className="sr-only">
                {label} {meaning !== undefined && meaning.length > 0 ? `· ${meaning} ` : ""}
                {hex}
              </span>
            </button>
          )
        })}
      </div>
      {activeSwatch && (
        <div className="space-y-1.5">
          <p className="font-mono text-xs text-foreground sm:text-sm">
            {activeSwatch.label} · {activeSwatch.hex.toUpperCase()}
          </p>
          {activeSwatch.meaning !== undefined && activeSwatch.meaning.length > 0 && (
            <p className="text-xs leading-snug text-muted-foreground sm:text-sm">{activeSwatch.meaning}</p>
          )}
        </div>
      )}
    </div>
  )
}

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
        className="font-display text-[0.65rem] font-bold uppercase tracking-[0.42em] text-muted-foreground mb-10"
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

export function HomeV2WelcomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const reduceMotion = useReducedMotion()
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
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [bootPhase])

  useEffect(() => {
    const id = searchParams.get("f")
    if (!id) return
    const q = searchParams.toString()
    router.replace(`${PRIDE_EXPLORE_PATH}${q ? `?${q}` : ""}`)
  }, [router, searchParams])

  const variants = useMemo(
    () => ({
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

  const bootContentRevealed = reduceMotion === true || bootPhase !== "bars"

  return (
    <div
      className="home-v2-root flex h-dvh min-h-0 flex-col text-foreground"
      aria-busy={bootPhase !== "off"}
    >
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {bootPhase === "off" ? "Pride Guide ready." : "Starting Pride Guide, please wait."}
      </p>
      <FlagAurora reduceMotion={reduceMotion} />
      <div className="home-v2-grain" aria-hidden />
      {reduceMotion !== true && bootPhase !== "off" && (
        <HomeV2BootOverlay phase={bootPhase} prideStripes={welcomeFlag.display.stripes ?? []} />
      )}
      <div className="home-v2-stack flex min-h-0 flex-1 flex-col">
        <Link
          href={PRIDE_EXPLORE_PATH}
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[260] focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        >
          Skip to flags
        </Link>

        <motion.section
          className="home-v2-hero flex min-h-0 flex-1 flex-col"
          aria-label="Welcome"
          initial="hidden"
          animate={bootContentRevealed ? "show" : "hidden"}
          variants={variants.heroWrap}
        >
          <motion.div variants={variants.item} className="mx-auto flex w-full max-w-6xl shrink-0 justify-end px-4 pt-6 sm:px-8 sm:pt-10">
            <ThemeToggle />
          </motion.div>

          <motion.div
            variants={variants.item}
            className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col justify-center pb-10"
          >
            <div className="max-w-2xl space-y-8">
              <div className="space-y-5">
                <div className="home-v2-kicker-rule" aria-hidden />
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.32em] text-primary">Prism · queer education</p>
                <h1 className="font-display text-[clamp(3rem,12vw,6.5rem)] font-black leading-[0.88] tracking-tight">
                  Pride
                  <br />
                  <span className="text-muted-foreground">Guide</span>
                </h1>
              </div>

              <div className="space-y-5">
                <p className="max-w-[44ch] text-balance font-display text-[clamp(1.25rem,3.4vw,1.85rem)] font-bold leading-snug tracking-tight text-foreground">
                  Welcome in. You're about to go deep on the symbols that hold our stories—color, history, and meaning,
                  turned up loud.
                </p>
                <p className="max-w-[54ch] text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
                  Learn on your own terms. No one owes you their identity as a lesson plan—and you still deserve to walk
                  away informed, fired up, and ready to show up for the community.
                </p>
              </div>

              <div>
                <Link
                  href={PRIDE_EXPLORE_PATH}
                  className="group inline-flex items-center gap-3 border-b-2 border-primary pb-1 font-display text-sm font-extrabold uppercase tracking-[0.2em] text-foreground transition-colors hover:border-foreground hover:text-primary"
                >
                  Start exploring
                  <span
                    className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-0.5"
                    aria-hidden
                  >
                    →
                  </span>
                </Link>
              </div>

              {/* <nav className="max-w-2xl space-y-4 border-t border-foreground/10 pt-8" aria-label="More ways to learn">
                <p className="font-display text-[0.65rem] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                  Also on Prism
                </p>
                <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-10 sm:gap-y-2">
                  <li>
                    <Link
                      href={PRIDE_QUIZ_PATH}
                      className="group inline-flex border-b border-transparent pb-0.5 font-display text-xs font-extrabold uppercase tracking-[0.18em] text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      Quiz
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={PRIDE_ALLY_PATH}
                      className="group inline-flex border-b border-transparent pb-0.5 font-display text-xs font-extrabold uppercase tracking-[0.18em] text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      Ally guide
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={PRIDE_ABOUT_APP_PATH}
                      className="group inline-flex border-b border-transparent pb-0.5 font-display text-xs font-extrabold uppercase tracking-[0.18em] text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      About the app
                    </Link>
                  </li>
                </ul>
                <p className="text-xs text-muted-foreground">
                  <Link href={PRIDE_CLASSIC_PATH} className="underline underline-offset-4 hover:text-foreground">
                    Original single-page layout
                  </Link>
                </p>
              </nav> */}
            </div>
          </motion.div>
        </motion.section>
      </div>
    </div>
  )
}

export function HomeV2ExploreContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const systemPrefersReducedMotion = useReducedMotion()
  const [motionPreference, setMotionPreference] = useState<ExploreMotionPreference>("system")
  const [studioPersist, setStudioPersist] = useState(false)
  const [explorePrefsHydrated, setExplorePrefsHydrated] = useState(false)
  const exploreStudioHydratedRef = useRef(false)

  const [index, setIndex] = useState(0)
  const [activeStripe, setActiveStripe] = useState<number | null>(null)
  const [waveBoost, setWaveBoost] = useState(false)
  const [columnCount, setColumnCount] = useState(18)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [browsePanel, setBrowsePanel] = useState<null | "details" | "palette" | "studio">(null)
  const [flagNavDir, setFlagNavDir] = useState<1 | -1>(1)
  const [stripeGap, setStripeGap] = useState(0)
  const [cornerRadius, setCornerRadius] = useState(0)
  const pointerStart = useRef<{ x: number } | null>(null)
  const stageRef = useRef<HTMLDivElement>(null)

  const effectiveReduceMotion =
    motionPreference === "reduce"
      ? true
      : motionPreference === "full"
        ? false
        : systemPrefersReducedMotion === true

  const applyStudioSnapshot = useCallback((s: ExploreStudioSnapshot) => {
    setColumnCount(s.columnCount)
    setWaveBoost(s.waveBoost)
    setStripeGap(s.stripeGap)
    setCornerRadius(s.cornerRadius)
  }, [])

  const onMotionPreferenceChange = useCallback((value: ExploreMotionPreference) => {
    setMotionPreference(value)
    try {
      localStorage.setItem(LS_EXPLORE_MOTION, value)
    } catch {
      /* ignore quota / private mode */
    }
  }, [])

  const onStudioPersistChange = useCallback(
    (persist: boolean) => {
      setStudioPersist(persist)
      try {
        localStorage.setItem(LS_EXPLORE_STUDIO_PERSIST, persist ? "1" : "0")
        if (persist) {
          localStorage.setItem(
            LS_EXPLORE_STUDIO,
            JSON.stringify({
              columnCount,
              waveBoost,
              stripeGap,
              cornerRadius,
            } satisfies ExploreStudioSnapshot)
          )
        }
      } catch {
        /* ignore */
      }
    },
    [columnCount, cornerRadius, stripeGap, waveBoost]
  )

  useEffect(() => {
    if (exploreStudioHydratedRef.current) return
    exploreStudioHydratedRef.current = true
    try {
      const motionRaw = localStorage.getItem(LS_EXPLORE_MOTION)
      if (motionRaw === "system" || motionRaw === "reduce" || motionRaw === "full") {
        setMotionPreference(motionRaw)
      }

      const persist = localStorage.getItem(LS_EXPLORE_STUDIO_PERSIST) === "1"
      setStudioPersist(persist)

      if (persist) {
        const raw = localStorage.getItem(LS_EXPLORE_STUDIO)
        const parsed = raw ? (JSON.parse(raw) as unknown) : null
        const snap = parseExploreStudioSnapshot(parsed)
        if (snap) {
          applyStudioSnapshot(snap)
        } else {
          const r = randomExploreStudioSnapshot()
          applyStudioSnapshot(r)
          localStorage.setItem(LS_EXPLORE_STUDIO, JSON.stringify(r))
        }
      } else {
        applyStudioSnapshot(randomExploreStudioSnapshot())
      }
    } catch {
      applyStudioSnapshot(randomExploreStudioSnapshot())
    }
    setExplorePrefsHydrated(true)
  }, [applyStudioSnapshot])

  useEffect(() => {
    if (!explorePrefsHydrated || !studioPersist) return
    try {
      localStorage.setItem(
        LS_EXPLORE_STUDIO,
        JSON.stringify({
          columnCount,
          waveBoost,
          stripeGap,
          cornerRadius,
        } satisfies ExploreStudioSnapshot)
      )
    } catch {
      /* ignore */
    }
  }, [columnCount, cornerRadius, explorePrefsHydrated, stripeGap, studioPersist, waveBoost])

  const flag = PRIDE_FLAGS[index]
  const stripes = flag.display.stripes ?? []
  const flagPalette = useMemo(() => collectFlagPalette(flag.display), [flag])
  const stripeAccent = useMemo(() => {
    const seen = new Set<string>()
    const uniqueHexes: string[] = []
    for (const s of flagPalette) {
      const key = (canonicalFlagHex(s.hex) ?? s.hex.trim()).toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      uniqueHexes.push(s.hex)
    }
    return averageStripeAccent(uniqueHexes)
  }, [flagPalette])

  const variants = useMemo(
    () => ({
      wrap: {
        hidden: {},
        show: {
          transition: effectiveReduceMotion ? {} : { staggerChildren: 0.09, delayChildren: 0.04 },
        },
      },
      item: {
        hidden: effectiveReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
        },
      },
    }),
    [effectiveReduceMotion]
  )

  const syncUrl = useCallback(
    (i: number) => {
      const id = PRIDE_FLAGS[i].id
      router.replace(`${PRIDE_EXPLORE_PATH}?f=${id}`, { scroll: false })
    },
    [router]
  )

  const goToIndex = useCallback(
    (i: number, intent?: "forward" | "backward") => {
      const next = clampIndex(i)
      if (next === index) return
      const dir =
        intent === "forward" ? 1 : intent === "backward" ? -1 : indexDeltaDir(index, next)
      setFlagNavDir(dir)
      setIndex(next)
      setActiveStripe(null)
      syncUrl(next)
    },
    [index, syncUrl]
  )

  useEffect(() => {
    const id = searchParams.get("f")
    if (!id) return
    const found = PRIDE_FLAGS.findIndex((f) => f.id === id)
    if (found >= 0) setIndex(found)
  }, [searchParams])

  useEffect(() => {
    if (searchParams.get("f")) return
    router.replace(`${PRIDE_EXPLORE_PATH}?f=${PRIDE_FLAGS[0].id}`, { scroll: false })
  }, [router, searchParams])

  const next = useCallback(() => goToIndex(index + 1, "forward"), [goToIndex, index])
  const prev = useCallback(() => goToIndex(index - 1, "backward"), [goToIndex, index])

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
    if (effectiveReduceMotion || !stageRef.current) return
    const rect = stageRef.current.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width - 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: ny * -6, y: nx * 9 })
  }

  const resetTilt = () => setTilt({ x: 0, y: 0 })

  const billow = waveBoost ? 1.35 : 0.85

  const frameRadiusStyle = useMemo((): CSSProperties | undefined => {
    if (cornerRadius <= 0) return undefined
    return { clipPath: "none", borderRadius: `${cornerRadius}px` }
  }, [cornerRadius])

  const studioShellStyle = useMemo((): CSSProperties | undefined => {
    if (cornerRadius <= 0) return undefined
    return { borderRadius: `${cornerRadius}px` }
  }, [cornerRadius])

  const exploreDrawerContentClass =
    "home-v2-explore-drawer-content flex max-h-[min(92dvh,56rem)] flex-col gap-0 rounded-none border-0 bg-transparent p-0 outline-none"
  const exploreDrawerHeaderClass =
    "home-v2-explore-drawer-header space-y-1 px-5 pb-4 pt-0 text-left sm:px-6"
  const exploreDrawerTitleClass =
    "font-display text-lg font-extrabold leading-tight tracking-tight text-foreground sm:text-xl"
  const exploreDrawerDescriptionClass = "text-sm leading-snug text-muted-foreground"
  const exploreDrawerBodyClass = "min-h-0 flex-1 overflow-y-auto px-5 pb-8 pt-4 sm:px-6"

  const exploreStudioSheetContentClass =
    cn("flex flex-col gap-0 bg-background p-0 sm:max-w-md lg:max-w-lg", cornerRadius > 0 && "rounded-lg")
  const exploreStudioSheetHeaderClass =
    cn("home-v2-explore-sheet-header space-y-1 border-b border-border/60 px-6 pb-4 pt-6 pr-14 text-left sm:pr-16", cornerRadius > 0 && "rounded-t-lg")
  const exploreStudioSheetBodyClass =
    cn("min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-6 pb-8 pt-5", cornerRadius > 0 && "rounded-b-lg")

  const flagStageSlideVariants = useMemo(
    () => ({
      initial: (dir: 1 | -1) =>
        effectiveReduceMotion ? { opacity: 0 } : { x: dir * 36, opacity: 0 },
      animate: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const },
      },
      exit: (dir: 1 | -1) =>
        effectiveReduceMotion
          ? { opacity: 0, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] as const } }
          : {
              x: dir * -36,
              opacity: 0,
              transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const },
            },
    }),
    [effectiveReduceMotion]
  )

  const forceFlagWaveMotion =
    !effectiveReduceMotion && systemPrefersReducedMotion === true

  return (
    <div
      className={cn(
        "home-v2-root flex h-dvh min-h-0 flex-col text-foreground",
        effectiveReduceMotion && "home-v2-explore-reduce-motion",
        forceFlagWaveMotion && "home-v2-explore-force-motion"
      )}
    >
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        Pride Guide flag explorer.
      </p>
      <div className="home-v2-grain" aria-hidden />
      <div className="home-v2-stack flex min-h-0 flex-1 flex-col">
        <motion.main
          id="home-v2-main"
          className="home-v2-browse flex min-h-0 flex-1 flex-col overflow-hidden bg-background/30"
          variants={variants.wrap}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={variants.item}
            className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col px-4 py-4 sm:px-8 sm:py-5"
          >
            <header className="home-v2-explore-header grid shrink-0 grid-cols-1 gap-x-4 gap-y-3 pb-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-y-2">
              <div className="relative min-w-0">
                <span
                  className="pointer-events-none absolute -left-8 z-0 select-none font-display text-[clamp(2.5rem,12vw,5rem)] font-black leading-none tracking-tighter text-foreground/[0.1] dark:text-foreground/[0.06]"
                  aria-hidden
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="relative z-10 flex min-h-0 flex-col gap-2 pt-1 pl-[clamp(2.75rem,11vw,4.5rem)] md:-ml-12">
                  <div className="h-[calc(2*2lh)]">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={flag.id}
                        initial={effectiveReduceMotion ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={effectiveReduceMotion ? undefined : { opacity: 0, y: -8 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="min-w-0 max-w-[min(100%,42rem)]"
                      >
                        <h2 className="line-clamp-2 font-display text-[clamp(1.35rem,4.2vw,2.75rem)] font-extrabold leading-[1.08] tracking-tight">
                          {flag.name}
                        </h2>
                        <div className="flex min-h-[1.75rem] shrink-0 items-center mt-2">
                          <Badge className="rounded-none border-transparent bg-foreground px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-widest text-background">
                            {flag.category}
                          </Badge>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </div>
              <div className="flex min-w-0 flex-col items-end justify-start gap-4 justify-self-end sm:flex-row sm:flex-wrap sm:items-center lg:pt-1">
                <span
                  className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground sm:pt-0.5 sm:text-sm"
                  aria-label={`Flag ${index + 1} of ${FLAG_COUNT}`}
                >
                  {index + 1}/{FLAG_COUNT}
                </span>
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={cn(
                          "gap-1.5 font-display text-xs font-bold uppercase tracking-wide",
                          cornerRadius <= 0 && "rounded-none"
                        )}
                        style={studioShellStyle}
                      >
                        <Menu className="size-3.5" aria-hidden />
                        <span className="hidden sm:inline">More</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="min-w-[11rem]">
                      <DropdownMenuItem asChild>
                        <Link href="/" className="flex cursor-pointer items-center gap-2 font-display text-xs font-bold uppercase tracking-wide">
                          <House className="size-4 opacity-80" aria-hidden />
                          Home
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={PRIDE_QUIZ_PATH} className="flex cursor-pointer items-center gap-2 font-display text-xs font-bold uppercase tracking-wide">
                          <Trophy className="size-4 opacity-80" aria-hidden />
                          Quiz
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={PRIDE_ALLY_PATH} className="flex cursor-pointer items-center gap-2 font-display text-xs font-bold uppercase tracking-wide">
                          <Heart className="size-4 opacity-80" aria-hidden />
                          Ally guide
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={PRIDE_ABOUT_APP_PATH} className="flex cursor-pointer items-center gap-2 font-display text-xs font-bold uppercase tracking-wide">
                          <Info className="size-4 opacity-80" aria-hidden />
                          About the app
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href={PRIDE_CLASSIC_PATH} className="flex cursor-pointer items-center gap-2 font-display text-xs font-bold uppercase tracking-wide">
                          Classic layout
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "gap-1.5 font-display text-xs font-bold uppercase tracking-wide lg:hidden",
                      cornerRadius <= 0 && "rounded-none"
                    )}
                    style={studioShellStyle}
                    onClick={() => setBrowsePanel("details")}
                  >
                    <BookOpen className="size-3.5" aria-hidden />
                    <span className="hidden sm:inline">About</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(
                      "gap-1.5 font-display text-xs font-bold uppercase tracking-wide lg:hidden",
                      cornerRadius <= 0 && "rounded-none"
                    )}
                    style={studioShellStyle}
                    onClick={() => setBrowsePanel("palette")}
                  >
                    <Palette className="size-3.5" aria-hidden />
                    <span className="hidden sm:inline">Colors</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn("gap-1.5 font-display text-xs font-bold uppercase tracking-wide", cornerRadius <= 0 && "rounded-none")}
                    style={studioShellStyle}
                    onClick={() => setBrowsePanel("studio")}
                  >
                    <SlidersHorizontal className="size-3.5" aria-hidden />
                    <span className="hidden sm:inline">Studio</span>
                  </Button>
                  <ThemeToggle />
                </div>
              </div>
            </header>

            <div className="home-v2-explore-body flex min-h-0 flex-1 flex-col gap-4 py-3 lg:flex-row lg:items-stretch lg:gap-6 xl:gap-8">
              <div
                ref={stageRef}
                className="home-v2-explore-flag flag-container relative mx-auto flex min-h-0 w-full min-w-0 flex-1 cursor-grab touch-pan-y flex-col justify-center active:cursor-grabbing lg:mx-0 lg:max-w-[min(36rem,46vw)] lg:flex-none xl:max-w-[min(38rem,44vw)]"
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
                style={{ perspective: effectiveReduceMotion ? undefined : "1100px" }}
              >
                <div className="mx-auto flex w-full max-w-4xl justify-center lg:max-w-full">
                  <div
                    className="home-v2-stage-shell flex h-[min(52dvh,560px)] w-full max-w-full flex-col"
                    style={frameRadiusStyle}
                  >
                    <div
                      className="home-v2-stage-inner home-v2-flag-bounds h-full min-h-0 w-full"
                      style={frameRadiusStyle}
                    >
                      <motion.div
                        className="relative grid h-full min-h-0 w-full place-items-center"
                        animate={effectiveReduceMotion ? {} : { rotateX: tilt.x, rotateY: tilt.y }}
                        transition={{ type: "spring", stiffness: 280, damping: 26 }}
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        <AnimatePresence mode="wait" initial={false} custom={flagNavDir}>
                          <motion.div
                            key={flag.id}
                            role="presentation"
                            custom={flagNavDir}
                            variants={flagStageSlideVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="relative col-start-1 row-start-1 grid h-full min-h-0 w-full place-items-center"
                            style={{ transformStyle: "preserve-3d" }}
                          >
                            {!effectiveReduceMotion && (
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
                            <AnimatedFlag
                              backgroundColors={stripes}
                              svgForeground={flag.display.svgForeground}
                              fit="contain"
                              numOfColumns={columnCount}
                              billow={billow}
                              columnGapPx={stripeGap}
                              stripeCornerRadiusPx={cornerRadius}
                            />
                          </motion.div>
                        </AnimatePresence>
                      </motion.div>
                    </div>
                  </div>
                </div>
                <p className="mx-auto mt-3 max-w-lg shrink-0 text-balance text-center text-sm leading-relaxed text-muted-foreground">
                  Drag, swipe, or use arrow keys to change flags
                </p>
              </div>

              <aside
                className="home-v2-explore-rail home-v2-browse-rail hidden min-h-0 min-w-0 w-full shrink-0 border-foreground/10 lg:flex lg:min-w-[min(18rem,32%)] lg:flex-1 lg:flex-col lg:pl-7 xl:min-w-[min(20rem,34%)] xl:pl-9"
                aria-label="About this flag and colors"
              >
                <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto overflow-x-hidden overscroll-contain pr-1 pt-8">
                  <HomeV2AboutBlock flag={flag} stripeAccent={stripeAccent} />
                  <HomeV2StripePaletteStrip
                    flagId={flag.id}
                    palette={flagPalette}
                    activeStripe={activeStripe}
                    variant="rail"
                    onStripeToggle={(swatchIndex) => {
                      setActiveStripe((prev) => (prev === swatchIndex ? null : swatchIndex))
                    }}
                  />
                </div>
              </aside>
            </div>

            <footer className="home-v2-explore-dock shrink-0" aria-label="Flag navigation">
              <div className="home-v2-explore-dock-frame">
                <div className="home-v2-explore-dock-surface">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
                    {/* <div className="order-2 flex flex-col items-center gap-1 lg:order-1 lg:w-36 lg:shrink-0 lg:items-start">
                      <span className="font-display text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">
                        Position
                      </span>
                      <p
                        className="font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground sm:text-3xl"
                        aria-live="polite"
                      >
                        {String(index + 1).padStart(2, "0")}
                        <span className="text-lg font-normal text-muted-foreground sm:text-xl">/{FLAG_COUNT}</span>
                      </p>
                    </div> */}

                    <div className="order-1 flex w-full items-center justify-center gap-2 sm:gap-3 lg:order-2 lg:flex-1 lg:px-4">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={prev}
                        aria-label="Previous flag"
                        className="size-12 rounded-none border-2 border-foreground/25 bg-background shadow-sm transition-[transform,box-shadow] hover:border-foreground/40 hover:shadow-md active:scale-[0.98] sm:size-14"
                      >
                        <ChevronLeft className="size-6 sm:size-7" />
                      </Button>
                      <Button
                        type="button"
                        onClick={shuffle}
                        className="h-12 min-w-[12.5rem] gap-2.5 rounded-none border-2 border-transparent bg-foreground px-6 font-display text-sm font-extrabold uppercase tracking-[0.12em] text-background shadow-lg transition-[transform,box-shadow] hover:brightness-110 active:scale-[0.99] sm:h-14 sm:min-w-[15rem] sm:px-10 sm:text-base sm:tracking-[0.14em]"
                      >
                        <Dices className="size-5 shrink-0 sm:size-6" aria-hidden />
                        Draw another
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={next}
                        aria-label="Next flag"
                        className="size-12 rounded-none border-2 border-foreground/25 bg-background shadow-sm transition-[transform,box-shadow] hover:border-foreground/40 hover:shadow-md active:scale-[0.98] sm:size-14"
                      >
                        <ChevronRight className="size-6 sm:size-7" />
                      </Button>
                    </div>

                    <ExploreKeyboardLegend className="order-3 border-t border-foreground/10 pt-4 lg:w-[min(100%,20rem)] lg:shrink-0 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0 xl:w-[min(100%,22rem)]" />
                  </div>
                </div>
              </div>
            </footer>
          </motion.div>
        </motion.main>

        <Drawer open={browsePanel === "details"} onOpenChange={(open) => setBrowsePanel(open ? "details" : null)}>
          <DrawerContent className={exploreDrawerContentClass}>
            <DrawerHeader className={exploreDrawerHeaderClass}>
              <p className="font-display text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">Focus</p>
              <DrawerTitle className={exploreDrawerTitleClass}>About this flag</DrawerTitle>
              <DrawerDescription className={exploreDrawerDescriptionClass}>{flag.name}</DrawerDescription>
            </DrawerHeader>
            <div className={exploreDrawerBodyClass}>
              <HomeV2AboutBlock flag={flag} stripeAccent={stripeAccent} />
            </div>
          </DrawerContent>
        </Drawer>

        <Drawer open={browsePanel === "palette"} onOpenChange={(open) => setBrowsePanel(open ? "palette" : null)}>
          <DrawerContent className={exploreDrawerContentClass}>
            <DrawerHeader className={exploreDrawerHeaderClass}>
              <p className="font-display text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">Palette</p>
              <DrawerTitle className={exploreDrawerTitleClass}>Flag colors</DrawerTitle>
              <DrawerDescription className={exploreDrawerDescriptionClass}>
                Hex values and what each color stands for—tap a swatch to inspect.
              </DrawerDescription>
            </DrawerHeader>
            <div className={exploreDrawerBodyClass}>
              <HomeV2StripePaletteStrip
                flagId={flag.id}
                palette={flagPalette}
                activeStripe={activeStripe}
                variant="drawer"
                onStripeToggle={(swatchIndex) => {
                  setActiveStripe((prev) => (prev === swatchIndex ? null : swatchIndex))
                }}
              />
            </div>
          </DrawerContent>
        </Drawer>

        <Sheet open={browsePanel === "studio"} onOpenChange={(open) => setBrowsePanel(open ? "studio" : null)}>
          <SheetContent side="right" className={exploreStudioSheetContentClass} style={studioShellStyle}>
            <SheetHeader className={exploreStudioSheetHeaderClass}>
              <p className="font-display text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">Studio</p>
              <SheetTitle className={exploreDrawerTitleClass}>Motion & layout</SheetTitle>
              <SheetDescription className={exploreDrawerDescriptionClass}>
                Fine-tune motion, slice layout, and frames.
              </SheetDescription>
            </SheetHeader>
            <div className={cn(exploreStudioSheetBodyClass, "space-y-5")}>
              {/* <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Label htmlFor="jump-flag-drawer" className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Jump to
                </Label>
                <Select value={flag.id} onValueChange={(id) => goToIndex(PRIDE_FLAGS.findIndex((f) => f.id === id))}>
                  <SelectTrigger id="jump-flag-drawer" className="w-full rounded-none border-foreground/15 sm:max-w-xs">
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
              </div> */}
              {/* Motion */}
              <div data-slot="motion" className={cn("space-y-3 p-4 bg-foreground/5", cornerRadius > 0 && "rounded-lg")} style={studioShellStyle}>
                <div>
                  <Label className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Motion
                  </Label>
                  <p className="mt-1 text-xs leading-snug text-muted-foreground text-balance">
                    Default follows your device. Override like the site theme.
                  </p>
                </div>
                <RadioGroup
                  value={motionPreference}
                  onValueChange={(v) => onMotionPreferenceChange(v as ExploreMotionPreference)}
                  className="grid gap-2.5 pt-1 sm:grid-cols-3"
                  aria-label="Reduce motion preference"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="system" id="explore-motion-system" />
                    <Label htmlFor="explore-motion-system" className="cursor-pointer text-sm font-normal leading-none">
                      System
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="reduce" id="explore-motion-reduce" />
                    <Label htmlFor="explore-motion-reduce" className="cursor-pointer text-sm font-normal leading-none">
                      Reduce
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="full" id="explore-motion-full" />
                    <Label htmlFor="explore-motion-full" className="cursor-pointer text-sm font-normal leading-none">
                      Full
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Save studio settings */}
              <div data-slot="save-studio-settings" className={cn("flex flex-col justify-between gap-3 p-4 bg-foreground/5", cornerRadius > 0 && "rounded-lg")} style={studioShellStyle}>
                <div className="min-w-0 space-y-0.5">
                  <Label htmlFor="studio-persist-drawer" className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Save studio settings
                  </Label>
                  <p className="text-xs leading-snug text-muted-foreground text-balance">
                    {studioPersist
                      ? "Layout and motion sliders stay as you left them."
                      : "Random slice layout, wave, gap, and corners on each visit."}
                  </p>
                </div>
                <Switch
                  id="studio-persist-drawer"
                  checked={studioPersist}
                  onCheckedChange={onStudioPersistChange}
                />
              </div>

              {/* Layout */}
              <div data-slot="layout" className={cn("flex flex-col justify-between gap-3 p-4 bg-foreground/5", cornerRadius > 0 && "rounded-lg")} style={studioShellStyle}>
                <div className="flex gap-2">
                  <Sparkles className="size-4 text-primary" aria-hidden />
                  <div className="flex flex-col gap-0.5">
                    <Label htmlFor="wave-boost-drawer" className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      Amp the wave
                    </Label>
                    <p className="mt-1 mb-2 text-xs leading-snug text-muted-foreground text-balance">
                      Higher values make the wave more pronounced.
                    </p>
                    <Switch id="wave-boost-drawer" checked={waveBoost} onCheckedChange={setWaveBoost} />
                  </div>
                </div>
              </div>

              {/* Slice resolution */}
              <div data-slot="slice-resolution" className={cn("space-y-2 p-4 bg-foreground/5", cornerRadius > 0 && "rounded-lg")} style={studioShellStyle}>
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

              {/* Gap between stripes */}
              <div data-slot="gap-between-stripes" className={cn("space-y-2 p-4 bg-foreground/5", cornerRadius > 0 && "rounded-lg")} style={studioShellStyle}>
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="stripe-gap-drawer" className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Gap between stripes
                  </Label>
                  <span className="text-xs tabular-nums text-muted-foreground">{stripeGap}px</span>
                </div>
                <Slider
                  id="stripe-gap-drawer"
                  value={[stripeGap]}
                  onValueChange={(v) => setStripeGap(v[0] ?? 0)}
                  min={0}
                  max={16}
                  step={1}
                  aria-label="Gap between flag stripe columns in pixels"
                />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Higher values can separate slices; SVG overlays may show seams at zero gap for continuity.
                </p>
              </div>

              {/* Rounded edges */}
              <div data-slot="rounded-edges" className={cn("space-y-2 p-4 bg-foreground/5", cornerRadius > 0 && "rounded-lg")} style={studioShellStyle}>
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="frame-radius-drawer" className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    Rounded edges
                  </Label>
                  <span className="text-xs tabular-nums text-muted-foreground">{cornerRadius}px</span>
                </div>
                <Slider
                  id="frame-radius-drawer"
                  value={[cornerRadius]}
                  onValueChange={(v) => setCornerRadius(v[0] ?? 0)}
                  min={0}
                  max={28}
                  step={1}
                  aria-label="Border radius for flag frames, studio panel, and stripe ends"
                />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  )
}

export function HomeV2Fallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
      <p className="text-xl font-display">Loading focus…</p>
    </div>
  )
}
