"use client"

import { useRef } from "react"
import type { CSSProperties, KeyboardEvent, ReactNode } from "react"
import { Check, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Preview colors mirror `app/globals.css` :root, `.dark`, and `.chillwave`.
 * Update both when theme tokens change.
 */
const light = {
	bg: "hsl(292 62% 93%)",
	card: "hsl(288 50% 98%)",
	border: "hsl(292 58% 58% / 0.45)",
	primary: "hsl(328 100% 46%)",
	accent: "hsl(44 100% 82%)",
} as const

const dark = {
	grad:
		"linear-gradient(to bottom right, hsl(232 58% 6%), hsl(258 52% 14%), hsl(300 55% 18%))",
	card: "hsl(235 52% 9%)",
	border: "hsl(225 48% 20% / 0.7)",
	primary: "hsl(187 100% 46%)",
	accent: "hsl(312 96% 60%)",
} as const

const chill = {
	grad:
		"linear-gradient(to bottom right, hsl(268 72% 8%), hsl(295 68% 16%), hsl(330 75% 26%))",
	card: "hsl(278 58% 13%)",
	border: "hsl(286 58% 32% / 0.55)",
	primary: "hsl(328 100% 68%)",
	accent: "hsl(46 100% 58%)",
} as const

function MiniChrome({
	bg,
	children,
}: {
	bg: string
	children: ReactNode
}) {
	return (
		<div
			className="relative aspect-[5/3] w-full overflow-hidden shadow-inner"
			style={{ background: bg }}
		>
			{children}
		</div>
	)
}

function LightPreview() {
	return (
		<MiniChrome bg={light.bg}>
			<div
				className="absolute inset-[10%_9%_auto] h-[38%] rounded-[3px] shadow-sm"
				style={{
					background: light.card,
					border: `1px solid ${light.border}`,
				}}
			/>
			<div
				className="absolute bottom-[12%] left-[11%] h-[9%] w-[32%] rounded-full"
				style={{ background: light.primary }}
			/>
			<div
				className="absolute bottom-[12%] right-[11%] h-[9%] w-[14%] rounded-full"
				style={{ background: light.accent }}
			/>
		</MiniChrome>
	)
}

function DarkPreview() {
	return (
		<MiniChrome bg={dark.grad}>
			<div
				className="absolute inset-[10%_9%_auto] h-[38%] rounded-[3px]"
				style={{
					background: dark.card,
					border: `1px solid ${dark.border}`,
					boxShadow: `0 0 10px ${dark.primary}33`,
				}}
			/>
			<div
				className="absolute bottom-[12%] left-[11%] h-[9%] w-[30%] rounded-full"
				style={{ background: dark.primary }}
			/>
			<div
				className="absolute bottom-[12%] right-[11%] h-[9%] w-[14%] rounded-full opacity-95"
				style={{ background: dark.accent }}
			/>
		</MiniChrome>
	)
}

function ChillwavePreview() {
	return (
		<MiniChrome bg={chill.grad}>
			<div
				className="absolute inset-[10%_9%_auto] h-[38%] rounded-[3px]"
				style={{
					background: chill.card,
					border: `1px solid ${chill.border}`,
					boxShadow: `0 0 12px ${chill.primary}55`,
				}}
			/>
			<div
				className="absolute bottom-[12%] left-[11%] h-[9%] w-[30%] rounded-full"
				style={{ background: chill.primary }}
			/>
			<div
				className="absolute bottom-[12%] right-[11%] h-[9%] w-[14%] rounded-full"
				style={{ background: chill.accent }}
			/>
		</MiniChrome>
	)
}

function SystemPreview() {
	return (
		<div className="relative aspect-[5/3] w-full overflow-hidden shadow-inner">
			<div className="absolute inset-0 grid grid-cols-2">
				<div className="h-full" style={{ background: light.bg }} />
				<div className="h-full" style={{ background: dark.grad }} />
			</div>
			<div
				className="absolute left-1/2 top-1/2 flex size-[26%] max-h-8 max-w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 shadow-md"
				style={{
					background: "hsl(0 0% 100% / 0.92)",
					borderColor: "hsl(292 58% 58% / 0.35)",
					color: "hsl(265 62% 10%)",
				}}
			>
				<Monitor className="size-[42%] min-w-[10px]" strokeWidth={2.25} aria-hidden />
			</div>
		</div>
	)
}

const PREVIEWS = {
	light: LightPreview,
	dark: DarkPreview,
	chillwave: ChillwavePreview,
	system: SystemPreview,
} as const

export type ExploreThemeId = keyof typeof PREVIEWS

const ORDER: ExploreThemeId[] = ["light", "dark", "chillwave", "system"]

const LABELS: Record<ExploreThemeId, string> = {
	light: "Light",
	dark: "Dark",
	chillwave: "Chillwave",
	system: "System",
}

export type ExploreThemeThumbnailGridProps = {
	theme: string | undefined
	setTheme: (value: string) => void
	shellStyle?: CSSProperties
	cornerRadius: number
}

export function ExploreThemeThumbnailGrid({
	theme,
	setTheme,
	shellStyle,
	cornerRadius,
}: ExploreThemeThumbnailGridProps) {
	const cornerSoft = cornerRadius > 0
	const thumbStyle: CSSProperties | undefined =
		cornerRadius > 0
			? { ...shellStyle, borderRadius: `${Math.max(0, cornerRadius - 4)}px` }
			: shellStyle

	const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

	const focusAt = (index: number) => {
		const len = ORDER.length
		const i = ((index % len) + len) % len
		itemRefs.current[i]?.focus()
	}

	const onThemeKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
		switch (e.key) {
			case "ArrowRight":
			case "ArrowDown":
				e.preventDefault()
				focusAt(index + 1)
				break
			case "ArrowLeft":
			case "ArrowUp":
				e.preventDefault()
				focusAt(index - 1)
				break
			case "Home":
				e.preventDefault()
				focusAt(0)
				break
			case "End":
				e.preventDefault()
				focusAt(ORDER.length - 1)
				break
			default:
				break
		}
	}

	return (
		<div
			className="grid w-full grid-cols-2 gap-4 p-4"
			role="radiogroup"
			aria-label="Site theme"
		>
			{ORDER.map((id, index) => {
				const Preview = PREVIEWS[id]
				const active = theme === id
				const label = LABELS[id]
				return (
					<button
						key={id}
						ref={(el) => {
							itemRefs.current[index] = el
						}}
						type="button"
						role="radio"
						aria-checked={active}
						onClick={() => setTheme(id)}
						onKeyDown={(e) => onThemeKeyDown(e, index)}
						className={cn(
							"group relative flex flex-col gap-1.5 rounded-md p-1.5 text-left outline-none",
							"transition-[opacity,transform] duration-200 ease-out motion-reduce:transition-none",
							"motion-safe:group-hover:-translate-y-0.5 motion-reduce:group-hover:translate-y-0",
							"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
						)}
						style={shellStyle}
					>
						<div
							className={cn(
								"relative w-full overflow-hidden border border-border/55 shadow-sm transition-[border-color,box-shadow,transform] duration-200 ease-out motion-reduce:transition-none",
								"motion-safe:group-hover:scale-[1.02] motion-reduce:group-hover:scale-100",
								"group-hover:border-primary/30 group-hover:shadow-md group-hover:shadow-primary/10",
								cornerSoft ? "rounded-md" : "rounded-none",
								active
									? "bg-primary/12 ring-2 ring-primary ring-offset-2 ring-offset-background"
									: "group-hover:ring-1 group-hover:ring-primary/20"
							)}
							style={thumbStyle}
						>
							<Preview />
							{active ? (
								<span
									className={cn(
										"absolute right-1 top-1 flex size-6 items-center justify-center text-primary-foreground shadow-sm",
										cornerSoft ? "rounded-full" : "rounded-none",
										"bg-primary"
									)}
									aria-hidden
								>
									<Check className="size-3.5 shrink-0" strokeWidth={2.5} />
								</span>
							) : null}
						</div>
						<span className="font-display text-[0.6rem] text-center font-bold uppercase tracking-[0.14em] text-foreground transition-colors duration-200 group-hover:text-primary">
							{label}
						</span>
					</button>
				)
			})}
		</div>
	)
}
