"use client"

import Link from "next/link"
import type { CSSProperties } from "react"
import { Heart, House, Info, Trophy } from "lucide-react"
import { PRIDE_ABOUT_APP_PATH, PRIDE_ALLY_PATH, PRIDE_QUIZ_PATH } from "@/lib/pride-routes"
import { cn } from "@/lib/utils"

const MORE_LINKS = [
	{ href: "/", label: "Home", Icon: House },
	{ href: PRIDE_QUIZ_PATH, label: "Quiz", Icon: Trophy },
	{ href: PRIDE_ALLY_PATH, label: "Ally guide", Icon: Heart },
	{ href: PRIDE_ABOUT_APP_PATH, label: "About app", Icon: Info },
] as const

/** Progress pride — hairline only, low contrast so it reads as craft detail, not sticker. */
const PRIDE_HAIRLINE =
	"linear-gradient(90deg,transparent 0%,#e40303 8%,#ff8c00 22%,#ffed00 38%,#008026 52%,#24408e 68%,#732787 84%,transparent 100%)"

export type ExploreMoreLinkGridProps = {
	shellStyle?: CSSProperties
	cornerRadius: number
}

export function ExploreMoreLinkGrid({
	shellStyle,
	cornerRadius,
}: ExploreMoreLinkGridProps) {
	const cornerSoft = cornerRadius > 0
	const thumbStyle: CSSProperties | undefined =
		cornerRadius > 0
			? { ...shellStyle, borderRadius: `${Math.max(0, cornerRadius - 4)}px` }
			: shellStyle

	const cellClass = cn(
		"group flex flex-col gap-2 rounded-md p-1.5 text-left outline-none",
		"transition-colors duration-200 ease-out",
		"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
	)

	const thumbClass = cn(
		"relative flex aspect-[5/3] w-full items-center justify-center overflow-hidden",
		"border border-border/45",
		"bg-gradient-to-b from-muted/20 via-card/50 to-muted/35",
		"shadow-[inset_0_1px_0_0_hsl(var(--foreground)/0.05)]",
		"transition-[border-color,box-shadow,background-color] duration-200 ease-out motion-reduce:transition-none",
		"group-hover:border-border/80",
		"group-hover:shadow-[inset_0_1px_0_0_hsl(var(--foreground)/0.07),0_0_0_1px_hsl(var(--primary)/0.08)]",
		cornerSoft ? "rounded-md" : "rounded-none"
	)

	const iconTileClass = cn(
		"relative z-[1] flex size-10 items-center justify-center",
		"border border-border/50 bg-background/90 text-foreground/75 shadow-sm",
		"transition-[color,border-color,box-shadow] duration-200 ease-out",
		"group-hover:border-primary/25 group-hover:text-primary group-hover:shadow-[0_1px_2px_hsl(var(--foreground)/0.04)]",
		cornerSoft ? "rounded-md" : "rounded-none"
	)

	const labelClass = cn(
		"font-display text-[0.6rem] text-center font-bold uppercase leading-tight tracking-[0.16em]",
		"text-muted-foreground transition-colors duration-200 group-hover:text-foreground"
	)

	const hairlineClass =
		"pointer-events-none absolute inset-x-4 bottom-0 h-px opacity-[0.22] motion-reduce:opacity-[0.14]"

	return (
		<nav className="grid w-full grid-cols-2 gap-3 p-3" aria-label="More links">
			{MORE_LINKS.map(({ href, label, Icon }) => (
				<Link key={href} href={href} className={cellClass} style={shellStyle}>
					<div className={thumbClass} style={thumbStyle}>
						<div className={hairlineClass} style={{ background: PRIDE_HAIRLINE }} aria-hidden />
						<span className={iconTileClass}>
							<Icon className="size-[18px] shrink-0" strokeWidth={1.75} aria-hidden />
						</span>
					</div>
					<span className={labelClass}>{label}</span>
				</Link>
			))}
		</nav>
	)
}
