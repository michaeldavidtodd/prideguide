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
	type ReactNode,
} from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useTheme } from "next-themes"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { AnimatedFlag } from "@/components/animated-flag"
import { ExploreMoreLinkGrid } from "@/components/explore-more-link-grid"
import {
	downloadAnimatedFlagGif,
	gifFilenameForFlag,
	type AnimatedFlagGifSpec,
} from "@/lib/animated-flag-gif"
import {
	canonicalFlagHex,
	collectFlagPalette,
	PRIDE_FLAGS,
	type FlagPaletteSwatch,
} from "@/lib/flags"
import { useToast } from "@/hooks/use-toast"
import {
	ArrowLeft,
	ArrowRight,
	Download,
	SlidersHorizontal,
	CircleArrowRight,
	Telescope,
	Keyboard,
} from "lucide-react"
import { HugeiconsIcon } from "@hugeicons/react"
import { SwipeLeft09Icon } from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { ExpandableTabBar, ExpandableTabBarDock } from "@/components/expandable-tab-bar"
import { ExploreThemeMenuPanel } from "@/components/explore-theme-menu-panel"
import { PRIDE_EXPLORE_PATH } from "@/lib/pride-routes"
import { resolveThemeDockTriggerIcon } from "@/lib/site-theme-meta"
import { notifyStudioShellSync, writeSyncedCornerRadius } from "@/lib/studio-shell-sync"
import {
	collectWelcomeStripeCandidates,
	pickWelcomeTextColorsAgainstBackground,
} from "@/lib/welcome-text-contrast"

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

/** Hex fallbacks for inline/CSS var usage (theme tokens are invalid inside `color:` in some cases). */
const AURORA_FALLBACK_BLOBS = ["#e40303", "#7848f5", "#0080ff"] as const

function useAuroraFlagsList() {
	return useMemo(() => {
		const map = new Map(PRIDE_FLAGS.map((f) => [f.id, f]))
		return AURORA_FLAG_IDS.map((id) => map.get(id)).filter(Boolean) as PrideFlag[]
	}, [])
}

function normalizeStripeHex(raw: string | undefined, fallback: string): string {
	if (!raw) return fallback
	return canonicalFlagHex(raw) ?? fallback
}

/** Horizontal colorband for the welcome kicker rule (matches full flag stripes when present). */
function welcomeKickerBandBackground(
	stripes: string[] | undefined,
	fallbacks: readonly [string, string, string]
): string {
	const list = (stripes?.filter((c) => typeof c === "string" && c.trim()) ?? []).map(
		(c) => canonicalFlagHex(c.trim()) ?? c.trim()
	)
	const colors = list.length > 0 ? list : [...fallbacks]
	if (colors.length === 0) return "hsl(var(--muted-foreground) / 0.45)"
	if (colors.length === 1) return colors[0]!
	const n = colors.length
	const stops: string[] = []
	for (let i = 0; i < n; i++) {
		const start = (i / n) * 100
		const end = ((i + 1) / n) * 100
		stops.push(`${colors[i]} ${start}% ${end}%`)
	}
	return `linear-gradient(90deg, ${stops.join(", ")})`
}

function auroraBlobsForIndex(
	auroraFlags: (typeof PRIDE_FLAGS)[number][],
	paletteIndex: number
) {
	const n = auroraFlags.length
	const safeIdx = n ? ((paletteIndex % n) + n) % n : 0
	const paletteFlag = n ? auroraFlags[safeIdx] : undefined
	const stripes = paletteFlag?.display.stripes ?? []
	return {
		blob1: normalizeStripeHex(stripes[0], AURORA_FALLBACK_BLOBS[0]),
		blob2: normalizeStripeHex(stripes[Math.floor(stripes.length / 2)], AURORA_FALLBACK_BLOBS[1]),
		blob3: normalizeStripeHex(stripes[stripes.length - 1], AURORA_FALLBACK_BLOBS[2]),
		paletteFlag,
	}
}

function useWelcomeAuroraPalette(reduceMotion: boolean | null) {
	const auroraFlags = useAuroraFlagsList()
	const n = auroraFlags.length
	const [paletteIndex, setPaletteIndex] = useState(0)

	useLayoutEffect(() => {
		if (n < 2) return
		setPaletteIndex(Math.floor(Math.random() * n))
	}, [n])

	useEffect(() => {
		if (reduceMotion === true || n < 2) return
		const t = window.setInterval(() => {
			setPaletteIndex((prev) => (prev + 1) % n)
		}, AURORA_CYCLE_MS)
		return () => window.clearInterval(t)
	}, [reduceMotion, n])

	return auroraBlobsForIndex(auroraFlags, paletteIndex)
}

/** Matches `animation` durations in globals.css for each blob variant. */
const AURORA_BLOB_DURATION_S = { 1: 18, 2: 22, 3: 26 } as const
type AuroraBlobId = keyof typeof AURORA_BLOB_DURATION_S

function shuffledAuroraBlobIds(): AuroraBlobId[] {
	const ids: AuroraBlobId[] = [1, 2, 3]
	for (let i = ids.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		const tmp = ids[i]!
		ids[i] = ids[j]!
		ids[j] = tmp
	}
	return ids
}

/** Random assignment of first/middle/last stripe colors to the three fixed blob slots. */
function shuffledStripePermutation(): readonly [number, number, number] {
	const a = [0, 1, 2]
	for (let i = a.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))
		const tmp = a[i]!
		a[i] = a[j]!
		a[j] = tmp
	}
	return [a[0]!, a[1]!, a[2]!]
}

function FlagAurora({ blobs }: { blobs: readonly [string, string, string] }) {
	const [blobOrder, setBlobOrder] = useState<AuroraBlobId[]>([1, 2, 3])
	const [stripePerm, setStripePerm] = useState<readonly [number, number, number]>([0, 1, 2])
	const [phaseDelays, setPhaseDelays] = useState<Record<AuroraBlobId, string>>({
		1: "0s",
		2: "0s",
		3: "0s",
	})

	useLayoutEffect(() => {
		setBlobOrder(shuffledAuroraBlobIds())
		setStripePerm(shuffledStripePermutation())
		setPhaseDelays({
			1: `${-(Math.random() * AURORA_BLOB_DURATION_S[1])}s`,
			2: `${-(Math.random() * AURORA_BLOB_DURATION_S[2])}s`,
			3: `${-(Math.random() * AURORA_BLOB_DURATION_S[3])}s`,
		})
	}, [])

	return (
		<div className="home-v2-aurora" aria-hidden>
			{blobOrder.map((id) => {
				const slot = id - 1
				const stripeIdx = stripePerm[slot]!
				return (
					<div
						key={id}
						className={`home-v2-aurora-blob home-v2-aurora-blob--${id}`}
						style={{
							background: blobs[stripeIdx],
							animationDelay: phaseDelays[id],
						}}
					/>
				)
			})}
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

/** Skip flag hotkeys only where arrows/space are part of native or Radix widget UX (not plain buttons/links). */
function eventTargetClaimsExploreNavKeys(target: EventTarget | null): boolean {
	const el = target as HTMLElement | null
	if (!el?.closest) return false
	if (el.closest("[contenteditable='true'], textarea, select")) return true
	if (
		el.closest(
			'[role="combobox"], [role="textbox"], [role="searchbox"], [role="slider"], [role="listbox"], [role="menu"], [role="menubar"], [role="radiogroup"]'
		)
	) {
		return true
	}
	const input = el.closest("input")
	if (input) {
		const t = (input as HTMLInputElement).type
		if (
			t === "hidden" ||
			t === "button" ||
			t === "submit" ||
			t === "reset" ||
			t === "checkbox" ||
			t === "radio" ||
			t === "file" ||
			t === "image"
		) {
			return false
		}
		if (t === "range" || t === "number") return true
		if (t === "" || t === "text") return true
		return /^(search|email|password|tel|url|date|datetime-local|month|time|week)$/i.test(t)
	}
	return false
}

/** Space toggles these; don’t hijack for shuffle (buttons/links use Enter / click instead). */
function eventTargetUsesSpaceToActivate(target: EventTarget | null): boolean {
	const el = target as HTMLElement | null
	if (!el?.closest) return false
	return Boolean(
		el.closest(
			'[role="checkbox"], [role="switch"], [role="radio"], input[type="checkbox"], input[type="radio"]'
		)
	)
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
	studioShellStyle,
}: {
	flag: PrideFlag
	stripeAccent: string
	className?: string
	studioShellStyle?: CSSProperties
}) {
	return (
		<div className={cn("space-y-0", className)}>
			<blockquote className="relative mb-6 border-none p-0 lg:mb-5">
				<div className="border-l-[5px] pl-3" style={{ borderLeftColor: stripeAccent }}>
					<p className="font-display text-[0.6rem] font-bold uppercase tracking-[0.2em] text-muted-foreground lg:text-[0.65rem]">
						Why it matters
					</p>
					<p className="mt-1 text-balance text-sm font-medium leading-relaxed text-foreground sm:text-base">{flag.significance}</p>
				</div>
			</blockquote>
			<Accordion data-slot="about-flag-accordion" type="single" collapsible  className="border border-foreground/10 bg-background/40" style={studioShellStyle}>
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
				<AccordionItem value="significance" className="border-none px-1">
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

const exploreKbdBtn =
	"cursor-pointer transition-[transform,box-shadow,background-color,border-color] hover:border-foreground/35 hover:bg-muted active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"

function ExploreKeyboardLegend({
	className,
	onPrevious,
	onNext,
	onRandom,
}: {
	className?: string
	onPrevious: () => void
	onNext: () => void
	onRandom: () => void
}) {
	return (
		<div
			className={cn("space-y-2.5", className)}
			role="region"
			aria-label="Keyboard shortcuts and quick actions"
		>
			<dl className="flex flex-row gap-4 justify-around text-sm leading-snug sm:text-[0.9375rem] sm:leading-snug">
				<div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
					<dt className="sr-only">Previous and next</dt>
					<dd className="grid grid-cols-2 items-center gap-2 text-foreground">
						<button
							type="button"
							className={cn(exploreKbd, exploreKbdBtn)}
							aria-label="Previous flag. Keyboard: Left arrow."
							onClick={onPrevious}
						>
							<ArrowLeft className="size-4" aria-hidden strokeWidth={2.25} />
						</button>
						<button
							type="button"
							className={cn(exploreKbd, exploreKbdBtn)}
							aria-label="Next flag. Keyboard: Right arrow."
							onClick={onNext}
						>
							<ArrowRight className="size-4" aria-hidden strokeWidth={2.25} />
						</button>
						<span className="col-span-2 text-muted-foreground">Navigate flags</span>
					</dd>
				</div>
				<div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
					<dt className="sr-only">Random flag</dt>
					<dd className="flex flex-col items-center gap-2 text-foreground">
						<button
							type="button"
							className={cn(exploreKbd, exploreKbdBtn, "min-w-[4.75rem] px-[1.38rem] !text-sm")}
							aria-label="Random flag. Keyboard: Space."
							onClick={onRandom}
						>
							Space
						</button>
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
	position,
	endAction,
}: {
	flagId: string
	palette: FlagPaletteSwatch[]
	activeStripe: number | null
	onStripeToggle: (swatchIndex: number) => void
	variant: "rail" | "drawer"
	/** Shown below the palette (1-based index, total flags). */
	position: { current: number; total: number }
	/** Rendered to the right of the position row (e.g. Download GIF on desktop rail). */
	endAction?: ReactNode
}) {
	const minH = variant === "rail" ? "min-h-11" : "min-h-16"
	const activeSwatch = activeStripe !== null ? palette.find((s) => s.index === activeStripe) : undefined
	return (
		<div className="space-y-2">
			{variant === "rail" && (
				<div className="px-4">
					<p className="font-display text-[0.6rem] font-bold uppercase tracking-[0.2em] text-muted-foreground lg:text-[0.65rem]">Flag colors</p>
					<p className="my-1 mb-4 text-base leading-snug">
						Tap a swatch for hex and what that color represents.
					</p>
				</div>
			)}
			<div
				data-slot="stripe-palette"
				className="flex gap-1 overflow-hidden rounded-sm shadow-sm px-4"
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
								"home-v2-stripe-swatch group relative min-w-0 flex-1 border-0 bg-transparent p-0 transition-[flex,transform] duration-200 ease-out focus-visible:outline-none",
								minH,
								active ? "z-[1] flex-[1.35]" : "hover:flex-[1.12] hover:brightness-105"
							)}
							onClick={() => onStripeToggle(swatchIndex)}
							aria-pressed={active}
							aria-label={a11yLabel}
						>
							<span
								className="home-v2-stripe-cut pointer-events-none absolute inset-0 z-0 block"
								style={{ backgroundColor: hex }}
								aria-hidden={true}
							/>
							<span
								className="home-v2-stripe-rim pointer-events-none absolute inset-0 z-[1] block"
								aria-hidden={true}
							/>
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
			<div className="mt-4 pt-4">
				<div
					className={cn(
						"flex gap-3 px-4",
						endAction ? "flex-wrap items-end justify-between" : "flex-col"
					)}
				>
					<p
						className="font-mono text-2xl font-semibold tabular-nums tracking-tight text-foreground sm:text-3xl"
						aria-live="polite"
						aria-label={`Flag ${position.current} of ${position.total}`}
					>
						{String(position.current).padStart(2, "0")}
						<span className="text-lg font-normal text-muted-foreground sm:text-xl">/{position.total}</span>
					</p>
					{endAction ? <div className="flex shrink-0">{endAction}</div> : null}
				</div>
			</div>
		</div>
	)
}

function HomeV2BootOverlay({ phase, prideStripes }: { phase: BootPhase; prideStripes: readonly string[] }) {
	if (phase === "off") return null

	const barCount = Math.max(1, prideStripes.length)

	return (
		<motion.div
			className="fixed inset-0 z-[250] flex flex-col items-center justify-center py-[min(22vh,10rem)] sm:pb-[min(26vh,12rem)]"
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
	const { blob1, blob2, blob3, paletteFlag } = useWelcomeAuroraPalette(reduceMotion)
	const welcomeFlag =
		paletteFlag ?? PRIDE_FLAGS.find((f) => f.id === "pride") ?? PRIDE_FLAGS[0]
	const kickerBandBackground = useMemo(
		() => welcomeKickerBandBackground(welcomeFlag.display.stripes, [blob1, blob2, blob3]),
		[welcomeFlag, blob1, blob2, blob3]
	)
	const homeRootRef = useRef<HTMLDivElement>(null)
	const { resolvedTheme } = useTheme()
	const [welcomeTextColors, setWelcomeTextColors] = useState<{
		text1: string | null
		text2: string | null
	}>({ text1: null, text2: null })

	useLayoutEffect(() => {
		const el = homeRootRef.current
		if (!el) return
		const cs = getComputedStyle(el)
		const bg = cs.getPropertyValue("--background").trim()
		const candidates = collectWelcomeStripeCandidates(
			welcomeFlag.display.stripes,
			blob1,
			blob2,
			blob3
		)
		const { text1, text2 } = pickWelcomeTextColorsAgainstBackground(bg, candidates)
		setWelcomeTextColors({ text1, text2 })
	}, [welcomeFlag, blob1, blob2, blob3, resolvedTheme])

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
			ref={homeRootRef}
			className="home-v2-root flex lg:h-dvh flex-col text-foreground"
			aria-busy={bootPhase !== "off"}
			style={
				{
					["--welcome-stripe-1" as string]: blob1,
					["--welcome-stripe-2" as string]: blob2,
					["--welcome-stripe-3" as string]: blob3,
					...(welcomeTextColors.text1 != null
						? { ["--welcome-text-1" as string]: welcomeTextColors.text1 }
						: {}),
					...(welcomeTextColors.text2 != null
						? { ["--welcome-text-2" as string]: welcomeTextColors.text2 }
						: {}),
				} as CSSProperties
			}
		>
			<p className="sr-only" aria-live="polite" aria-atomic="true">
				{bootPhase === "off" ? "Pride Guide ready." : "Starting Pride Guide, please wait."}
			</p>
			<FlagAurora blobs={[blob1, blob2, blob3]} />
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
					className="home-v2-hero home-v2-welcome flex flex-1 flex-col"
					aria-label="Welcome"
					initial="hidden"
					animate={bootContentRevealed ? "show" : "hidden"}
					variants={variants.heroWrap}
				>
					{/* <motion.div variants={variants.item} className="mx-auto flex w-full max-w-6xl shrink-0 justify-end px-4 pt-6 sm:px-8 sm:pt-10">
						<ThemeToggle />
					</motion.div> */}

					<motion.div
						variants={variants.item}
						className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col justify-center pb-10 px-6 md:px-12"
					>
						<div className="flex w-full min-h-0 flex-col gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-4 xl:gap-10 py-12">
							<div className="min-w-0 flex-1 space-y-8 lg:max-w-[min(100%,40rem)] lg:pr-2">
								<div className="space-y-5">
									<div
										className="home-v2-kicker-rule"
										style={{ background: kickerBandBackground }}
										aria-hidden
									/>
									<p
										className={cn(
											"w-fit text-[0.7rem] font-bold uppercase tracking-[0.32em]",
											reduceMotion ? "text-primary" : "home-v2-welcome-accent-text"
										)}
									>
										Prism · queer education
									</p>
									<h1 className="font-display text-[clamp(3rem,12vw,6.5rem)] font-black leading-[0.88] tracking-tight">
										<span
											className={cn(
												"block",
												reduceMotion ? "text-primary" : "home-v2-welcome-accent-text"
											)}
										>
											Pride
										</span>
										<span
											className={cn(
												"block",
												reduceMotion ? "text-muted-foreground" : "home-v2-welcome-guide-accent"
											)}
										>
											Guide
										</span>
									</h1>
								</div>

								<div className="space-y-5">
									<p className="home-v2-welcome-lead max-w-[44ch] text-balance font-display text-[clamp(1.25rem,3.4vw,1.85rem)] font-bold leading-snug tracking-tight">
										Welcome in. You're about to go deep on the symbols that hold our stories—color, history, and meaning,
										turned up loud.
									</p>
									<p className="home-v2-welcome-lead max-w-[54ch] text-balance text-base leading-relaxed sm:text-lg">
										Learn on your own terms. No one owes you their identity as a lesson plan—and you still deserve to walk
										away informed, fired up, and ready to show up for the community.
									</p>
								</div>

								<div>
									<Link
										href={PRIDE_EXPLORE_PATH}
										className="home-v2-welcome-cta group inline-flex items-center gap-3 border-none px-12 py-4 font-display text-xs md:text-sm font-extrabold border-2 rounded-full uppercase tracking-[0.2em] max-md:w-full max-md:justify-center"
									>
										<span className="hidden md:inline">Start exploring</span>
										<span className="inline md:hidden">Explore</span>
										<span
											className="inline-block transition-transform duration-300 ease-out group-hover:translate-x-0.5"
											aria-hidden
										>
											<Telescope className="size-8" />
										</span>
									</Link>
								</div>
							</div>

							<motion.aside
								variants={variants.item}
								className="mx-auto flex w-full shrink-0 flex-col space-y-3 lg:mx-0 lg:w-[min(100%,380px)] xl:w-[min(100%,380px)]"
								aria-label="Background aurora palette"
							>
								<div className="home-v2-flag-bounds aspect-[3/2.5] w-full rounded-xl border border-foreground/10 bg-background/25 p-8 shadow-sm backdrop-blur-[2px]">
									<AnimatePresence mode="wait" initial={false}>
										<motion.div
											key={welcomeFlag.id}
											role="img"
											aria-label={welcomeFlag.name}
											initial={reduceMotion ? false : { opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
											transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
											className="grid h-full min-h-0 w-full place-items-center"
										>
											<AnimatedFlag
												backgroundColors={welcomeFlag.display.stripes ?? []}
												svgForeground={welcomeFlag.display.svgForeground}
												fit="contain"
												numOfColumns={22}
												billow={reduceMotion ? 0 : 0.75}
												className="!drop-shadow-[0_8px_28px_hsl(var(--foreground)/0.12)]"
											/>
										</motion.div>
									</AnimatePresence>
								</div>
								<p className="font-display text-xl font-bold leading-snug text-foreground text-center lg:text-left">
									{welcomeFlag.name}
								</p>
								<Link
									href={`${PRIDE_EXPLORE_PATH}?f=${welcomeFlag.id}`}
									className="flex items-center justify-center lg:justify-start gap-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary underline-offset-4 transition-colors hover:text-primary/90 hover:underline"
								>
									Explore this flag
									<CircleArrowRight className="w-4 h-4" />
								</Link>
							</motion.aside>

						</div>
					</motion.div>
				</motion.section>
			</div>

		</div>
	)
}

export function HomeV2ExploreContent() {
	const { toast } = useToast()
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
	const [flagNavDir, setFlagNavDir] = useState<1 | -1>(1)
	const [stripeGap, setStripeGap] = useState(0)
	const [cornerRadius, setCornerRadius] = useState(0)
	const [gifExporting, setGifExporting] = useState(false)
	const pointerStart = useRef<{ x: number } | null>(null)
	const stageRef = useRef<HTMLDivElement>(null)
	const activeThumbRef = useRef<HTMLButtonElement>(null)
	const exploreThumbnailsScrollRef = useRef<HTMLDivElement>(null)
	const { theme, setTheme, themes: availableThemeIds } = useTheme()
	const [exploreThemeMounted, setExploreThemeMounted] = useState(false)

	useEffect(() => {
		setExploreThemeMounted(true)
	}, [])

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

	useEffect(() => {
		if (!explorePrefsHydrated) return
		writeSyncedCornerRadius(cornerRadius)
		notifyStudioShellSync()
	}, [cornerRadius, explorePrefsHydrated])

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
			window.history.replaceState(null, "", `${PRIDE_EXPLORE_PATH}?f=${id}`)
		},
		[]
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
		const params = new URLSearchParams(window.location.search)
		const id = params.get("f")
		if (id) {
			const found = PRIDE_FLAGS.findIndex((f) => f.id === id)
			if (found >= 0) setIndex(found)
		} else {
			window.history.replaceState(null, "", `${PRIDE_EXPLORE_PATH}?f=${PRIDE_FLAGS[0].id}`)
		}
	}, [])

	useLayoutEffect(() => {
		const container = exploreThumbnailsScrollRef.current
		const thumb = activeThumbRef.current
		if (!container || !thumb) return
		// scrollIntoView walks ancestors and can scroll the document; only move the thumb strip.
		if (container.clientWidth === 0) return
		const cRect = container.getBoundingClientRect()
		const tRect = thumb.getBoundingClientRect()
		const delta =
			tRect.left + tRect.width / 2 - (cRect.left + cRect.width / 2)
		if (Math.abs(delta) < 1) return
		container.scrollBy({
			left: delta,
			behavior: effectiveReduceMotion ? "auto" : "smooth",
		})
	}, [effectiveReduceMotion, index])

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
			if (eventTargetClaimsExploreNavKeys(e.target)) return
			if (e.key === "ArrowRight") {
				e.preventDefault()
				next()
			}
			if (e.key === "ArrowLeft") {
				e.preventDefault()
				prev()
			}
			if (e.key === " ") {
				if (eventTargetUsesSpaceToActivate(e.target)) return
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

	const exploreGifSpec = useMemo((): AnimatedFlagGifSpec => {
		return {
			backgroundColors: stripes,
			svgForeground: flag.display.svgForeground,
			numOfColumns: columnCount,
			staggeredDelayMs: 150,
			billow,
			columnGapPx: stripeGap,
			stripeCornerRadiusPx: cornerRadius > 0 ? cornerRadius : undefined,
		}
	}, [billow, columnCount, cornerRadius, flag.display.svgForeground, stripeGap, stripes])

	const handleDownloadAnimatedGif = useCallback(async () => {
		if (gifExporting) return
		setGifExporting(true)
		try {
			await downloadAnimatedFlagGif(exploreGifSpec, flag.id)
			toast({
				title: "GIF downloaded",
				description: `Saved as ${gifFilenameForFlag(flag.id)}.`,
			})
		} catch {
			toast({
				title: "Could not create GIF",
				description: "Try again, or use a different browser.",
				variant: "destructive",
			})
		} finally {
			setGifExporting(false)
		}
	}, [exploreGifSpec, flag.id, gifExporting, toast])

	// const frameRadiusStyle = useMemo((): CSSProperties | undefined => {
	// 	if (cornerRadius <= 0) return undefined
	// 	return { clipPath: "none", borderRadius: `${cornerRadius}px` }
	// }, [cornerRadius])

	const studioShellStyle = useMemo((): CSSProperties | undefined => {
		if (cornerRadius <= 0) return undefined
		return { borderRadius: `${cornerRadius}px` }
	}, [cornerRadius])

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

	const ExploreThemeIcon = resolveThemeDockTriggerIcon(theme, exploreThemeMounted, availableThemeIds)

	return (
		<div
			className={cn(
				"explore-page-root flex min-w-0 w-full flex-col max-md:pb-20 xl:min-h-0 xl:flex-1",
				effectiveReduceMotion && "home-v2-explore-reduce-motion",
				forceFlagWaveMotion && "home-v2-explore-force-motion"
			)}
		>
			<p className="sr-only" aria-live="polite" aria-atomic="true">
				Pride Guide flag explorer.
			</p>
			<div className="home-v2-stack flex min-w-0 w-full flex-col xl:min-h-0 xl:flex-1">
				<motion.main
					id="home-v2-main"
					className="home-v2-browse flex min-w-0 w-full flex-col xl:min-h-0 xl:flex-1"
					variants={variants.wrap}
					initial="hidden"
					animate="show"
				>
					<motion.div
						variants={variants.item}
						className="mx-auto flex min-h-0 min-w-0 w-full max-w-full flex-col xl:h-full xl:flex-1"
					>

						{/* Explore Body */}
						<div data-slot="explore-body" className="explore-body">
							<div
								data-slot="explore-flag"
								ref={stageRef}
								className="explore-flag flag-container"
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
								<AnimatePresence mode="wait" initial={false} custom={flagNavDir}>
									<motion.div
										key={flag.id}
										role="presentation"
										custom={flagNavDir}
										variants={flagStageSlideVariants}
										initial="initial"
										animate="animate"
										exit="exit"
										className="explore-flag-motion-container"
									>
										<AnimatedFlag
											backgroundColors={stripes}
											svgForeground={flag.display.svgForeground}
											fit="contain"
											numOfColumns={columnCount}
											billow={billow}
											columnGapPx={stripeGap}
											stripeCornerRadiusPx={cornerRadius}
											dropShadowColor={stripeAccent}
											className="explore-flag-stage"
										/>
									</motion.div>
								</AnimatePresence>

							</div>

							<nav
								data-slot="explore-flag-thumbs"
								className="explore-flag-thumbs max-lg:hidden shrink-0 py-3 min-w-0 w-full"
								aria-label="All flags"
							>
								<div
									ref={exploreThumbnailsScrollRef}
									data-slot="explore-flag-thumbnails"
									className="explore-flag-thumbnails"
								>
									{PRIDE_FLAGS.map((f, i) => {
										const thumbStripes = f.display.stripes ?? []
										const selected = i === index
										return (
											<button
												key={f.id}
												ref={selected ? activeThumbRef : undefined}
												type="button"
												onClick={() => goToIndex(i)}
												aria-label={`Show ${f.name}`}
												aria-current={selected ? "true" : undefined}
												className="explore-flag-thumbnail relative outline-none px-1"
											>
												<AnimatedFlag
													backgroundColors={thumbStripes}
													svgForeground={f.display.svgForeground}
													fit="contain"
													numOfColumns={10}
													billow={0}
													columnGapPx={0}
													className={cn(
														"animated-flag--radius-controlled max-h-[92%] max-w-full !overflow-hidden focus-visible:ring-2 focus-visible:ring-ring ring-offset-4 ring-offset-background hover:opacity-100 transition-all duration-200 ease-out",
														selected
															? "ring-2 ring-foreground"
															: "opacity-75"
													)}
													style={studioShellStyle}
												/>
											</button>
										)
									})}
								</div>
							</nav>

							<aside
								data-slot="explore-content"
								className="explore-content"
								aria-label="About this flag and colors"
							>
								<AnimatePresence mode="wait" initial={false} custom={flagNavDir}>
									<motion.div
										key={flag.id}
										custom={flagNavDir}
										variants={flagStageSlideVariants}
										initial="initial"
										animate="animate"
										exit="exit"
										className="explore-content-inner"
									>
										<div className="relative flex flex-row items-center justify-between min-w-0 max-lg:flex-1 max-md:flex-col lg:-ml-[1.1rem]">
											<span
												className="max-md:hidden pointer-events-none absolute left-2 z-0 select-none font-display text-[clamp(2.5rem,12vw,5rem)] font-black leading-none tracking-tighter text-foreground/[0.1] dark:text-foreground/[0.06]"
												aria-hidden
											>
												{String(index + 1).padStart(2, "0")}
											</span>
											<div data-slot="explore-header-title" className="max-md:order-2 relative z-10 flex w-full flex-col gap-2 pt-1 max-md:px-4 md:pl-[clamp(2.75rem,11vw,4.5rem)] xl:pr-16">
												<h2 className="line-clamp-2 font-display text-2xl lg:text-[clamp(1.35rem,4.2vw,2.75rem)] font-extrabold leading-[1] tracking-tight text-balance">
													{flag.name}
												</h2>
												<div className="flex min-h-[1.75rem] shrink-0 items-center mt-1 ml-1">
													<Badge className="rounded-none border-transparent bg-foreground px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-widest text-background">
														{flag.category}
													</Badge>
												</div>
											</div>
											<div
												className="max-md:order-1 md:bg-primary/10 md:border-2 md:border-border/20 md:p-4 text-foreground text-sm leading-none text-center flex flex-row md:flex-col gap-2 items-center max-md:mb-4 mr-6 lg:hidden"
												aria-hidden
												style={studioShellStyle}
											>
												<HugeiconsIcon
													icon={SwipeLeft09Icon}
													strokeWidth={1.5}
													className="size-6"
												/>
												Swipe the flag
											</div>
										</div>
										<div data-slot="explore-content-body" className="explore-content-body" style={studioShellStyle}>
											<HomeV2AboutBlock
												flag={flag}
												stripeAccent={stripeAccent}
												studioShellStyle={studioShellStyle}
											/>
											<HomeV2StripePaletteStrip
												flagId={flag.id}
												palette={flagPalette}
												activeStripe={activeStripe}
												variant="rail"
												position={{ current: index + 1, total: FLAG_COUNT }}
												onStripeToggle={(swatchIndex) => {
													setActiveStripe((prev) => (prev === swatchIndex ? null : swatchIndex))
												}}
												endAction={
													<Button
														type="button"
														variant="outline"
														size="sm"
														className={cn(
															"gap-2 px-6 font-display text-xs font-bold uppercase tracking-wide",
															cornerRadius <= 0 && "rounded-none"
														)}
														style={studioShellStyle}
														disabled={gifExporting}
														onClick={() => void handleDownloadAnimatedGif()}
													>
														<Download className="size-3.5 shrink-0 opacity-80" aria-hidden />
														{gifExporting ? "Encoding GIF…" : "Download GIF"}
													</Button>
												}
											/>
										</div>
									</motion.div>
								</AnimatePresence>
							</aside>
						</div>

					</motion.div>
				</motion.main>

				<ExpandableTabBarDock data-dock="explore">
					<ExpandableTabBar
						style={studioShellStyle}
						chipsSoftCorners={cornerRadius > 0}
						tabs={[
							{
								id: "keyboard",
								label: "Shortcuts",
								icon: <Keyboard className="size-3.5" aria-hidden />,
								content: (
									<div className="min-w-[min(100vw-4rem,28rem)] space-y-3">
										<header className="space-y-1">
											<p className="font-display text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">Navigation</p>
											<h2 className="font-display text-lg font-extrabold leading-tight tracking-tight text-foreground">Keyboard shortcuts</h2>
											<p className="text-sm leading-snug text-muted-foreground">Navigate flags and more with your keyboard.</p>
										</header>
										<ExploreKeyboardLegend
											onPrevious={prev}
											onNext={next}
											onRandom={shuffle}
											className="py-12"
										/>
									</div>
								),
							},
							{
								id: "studio",
								label: "Settings",
								icon: <SlidersHorizontal className="size-3.5" aria-hidden />,
								content: (
									<div className="min-w-[min(100vw-4rem,28rem)] space-y-4 pb-4">
										<header className="space-y-1 pb-3">
											<p className="font-display text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">Studio</p>
											<h2 className="font-display text-lg font-extrabold leading-tight tracking-tight text-foreground">Motion & layout</h2>
											<p className="text-sm leading-snug text-muted-foreground">Fine-tune motion, slice layout, and frames.</p>
										</header>

										{/* Motion preferences */}
										<div
											data-slot="motion"
											className={cn(
												"space-y-3 p-4 bg-foreground/5",
												cornerRadius > 0 && "rounded-lg"
											)}
											style={studioShellStyle}
										>
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
												onValueChange={(v) =>
													onMotionPreferenceChange(v as ExploreMotionPreference)
												}
												className="grid gap-2.5 pt-1 sm:grid-cols-3"
												aria-label="Reduce motion preference"
											>
												<div className="flex items-center gap-2">
													<RadioGroupItem value="system" id="explore-motion-system" />
													<Label
														htmlFor="explore-motion-system"
														className="cursor-pointer text-sm font-normal leading-none"
													>
														System
													</Label>
												</div>
												<div className="flex items-center gap-2">
													<RadioGroupItem value="reduce" id="explore-motion-reduce" />
													<Label
														htmlFor="explore-motion-reduce"
														className="cursor-pointer text-sm font-normal leading-none"
													>
														Reduce
													</Label>
												</div>
												<div className="flex items-center gap-2">
													<RadioGroupItem value="full" id="explore-motion-full" />
													<Label
														htmlFor="explore-motion-full"
														className="cursor-pointer text-sm font-normal leading-none"
													>
														Full
													</Label>
												</div>
											</RadioGroup>
										</div>
										
										{/* Slice resolution */}
										<div
											className={cn(
												"space-y-2 p-4 bg-foreground/5",
												cornerRadius > 0 && "rounded-lg"
											)}
											style={studioShellStyle}
										>
											<div className="flex items-center justify-between gap-3">
												<Label className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
													Slice resolution
												</Label>
												<span className="text-xs tabular-nums text-muted-foreground">
													{columnCount} columns
												</span>
											</div>
											<Slider
												value={[columnCount]}
												onValueChange={(v) => setColumnCount(v[0] ?? 18)}
												min={10}
												max={32}
												step={1}
												aria-label="Adjust column count"
											/>
										</div>

										{/* Gap between stripes */}
										<div
											className={cn(
												"space-y-2 p-4 bg-foreground/5",
												cornerRadius > 0 && "rounded-lg"
											)}
											style={studioShellStyle}
										>
											<div className="flex items-center justify-between gap-3">
												<Label className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
													Gap between stripes
												</Label>
												<span className="text-xs tabular-nums text-muted-foreground">
													{stripeGap}px
												</span>
											</div>
											<Slider
												value={[stripeGap]}
												onValueChange={(v) => setStripeGap(v[0] ?? 0)}
												min={0}
												max={16}
												step={1}
												aria-label="Gap between stripes"
											/>
										</div>

										{/* Rounded edges */}
										<div
											className={cn(
												"space-y-2 p-4 bg-foreground/5",
												cornerRadius > 0 && "rounded-lg"
											)}
											style={studioShellStyle}
										>
											<div className="flex items-center justify-between gap-3">
												<Label className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
													Rounded edges
												</Label>
												<span className="text-xs tabular-nums text-muted-foreground">
													{cornerRadius}px
												</span>
											</div>
											<Slider
												value={[cornerRadius]}
												onValueChange={(v) => setCornerRadius(v[0] ?? 0)}
												min={0}
												max={28}
												step={1}
												aria-label="Border radius"
											/>
										</div>

										{/* Save studio settings */}
										<div
											className={cn(
												"flex flex-row justify-between gap-3 p-4 bg-foreground/5",
												cornerRadius > 0 && "rounded-lg"
											)}
											style={studioShellStyle}
										>
											<div className="min-w-0 space-y-0.5">
												<Label
													htmlFor="studio-persist-etb"
													className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground"
												>
													Save studio settings
												</Label>
												<p className="text-xs leading-snug text-muted-foreground text-balance">
													{studioPersist
														? "Layout and motion sliders stay as you left them."
														: "Random slice layout on each visit."}
												</p>
											</div>
											<Switch
												id="studio-persist-etb"
												checked={studioPersist}
												onCheckedChange={onStudioPersistChange}
											/>
										</div>

										{/* Export GIF */}
										<div
											className={cn(
												"space-y-2 p-4 bg-foreground/5",
												cornerRadius > 0 && "rounded-lg"
											)}
											style={studioShellStyle}
										>
											<Label className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
												Export
											</Label>
											<Button
												type="button"
												variant="outline"
												className={cn(
													"w-full gap-2 font-display text-xs font-bold uppercase tracking-wide",
													cornerRadius <= 0 && "rounded-none"
												)}
												style={studioShellStyle}
												disabled={gifExporting}
												onClick={() => void handleDownloadAnimatedGif()}
											>
												<Download className="size-4 shrink-0 opacity-80" aria-hidden />
												{gifExporting ? "Encoding…" : "Download GIF"}
											</Button>
										</div>
									</div>
								),
							},
							{
								id: "more",
								label: "More",
								icon: <Telescope className="size-3.5" aria-hidden />,
								content: (
									<div className="min-w-[min(100vw-4rem,28rem)]">
										<header className="space-y-1 pt-1 pb-2">
											<p className="font-display text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">Explore</p>
											<h2 className="font-display text-lg font-extrabold leading-tight tracking-tight text-foreground">More</h2>
										</header>
										<ExploreMoreLinkGrid
											shellStyle={studioShellStyle}
											cornerRadius={cornerRadius}
										/>
									</div>
								),
							},
							{
								id: "theme",
								label: "Theme",
								icon: <ExploreThemeIcon className="size-3.5" aria-hidden />,
								content: (
									<ExploreThemeMenuPanel
										theme={theme}
										setTheme={setTheme}
										shellStyle={studioShellStyle}
										cornerRadius={cornerRadius}
									/>
								),
							},
						]}
					/>
				</ExpandableTabBarDock>

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
