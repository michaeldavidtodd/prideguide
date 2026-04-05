"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { PRIDE_ABOUT_APP_PATH, PRIDE_ALLY_PATH, PRIDE_QUIZ_PATH } from "@/lib/pride-routes"
import { cn } from "@/lib/utils"

const learnNavLinks = [
  { href: PRIDE_QUIZ_PATH, label: "Quiz" },
  { href: PRIDE_ALLY_PATH, label: "Ally guide" },
  { href: PRIDE_ABOUT_APP_PATH, label: "About the app" },
] as const

export function PrideLearnChrome({
  kicker,
  title,
  description,
  children,
  wideLayout = false,
}: {
  kicker: string
  title: string
  description?: string
  children: ReactNode
  /** Use full content width on large screens (e.g. quiz grid). */
  wideLayout?: boolean
}) {
  const pathname = usePathname()

  return (
    <div className="home-v2-root flex min-h-dvh flex-col text-foreground">
      <div
        data-slot="chrome-header"
        className="mx-auto flex w-full max-w-7xl shrink-0 flex-wrap items-center justify-end gap-2 px-4 pt-6 sm:px-8"
      >
        <nav className="flex flex-wrap items-center justify-end gap-2" aria-label="Prism">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-none font-display text-xs font-bold uppercase tracking-wide"
          >
            <Link href="/">
              <ChevronLeft className="size-3.5" aria-hidden />
              Home
            </Link>
          </Button>
          {learnNavLinks.map(({ href, label }) => {
            const active = pathname === href
            return (
              <Button
                key={href}
                asChild
                variant="outline"
                size="sm"
                className="rounded-none font-display text-xs font-bold uppercase tracking-wide"
              >
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(active && "border-primary bg-primary/5 text-primary")}
                >
                  {label}
                </Link>
              </Button>
            )
          })}
        </nav>
        <ThemeToggle />
      </div>
      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-4 pb-16 pt-8 sm:px-8 sm:pt-10">
        <header className={wideLayout ? "max-w-4xl lg:max-w-none" : "max-w-[min(100%,42rem)]"}>
          <p className="font-display text-[0.65rem] font-bold uppercase leading-none tracking-[0.28em] text-primary sm:text-[0.7rem]">
            {kicker}
          </p>
          <h1 className="mt-3 font-display text-[clamp(1.75rem,4.5vw,2.5rem)] font-black leading-[1.08] tracking-tight">
            {title}
          </h1>
          {description ? (
            <p className="mt-4 text-balance text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-[1.0625rem] sm:leading-[1.65]">
              {description}
            </p>
          ) : null}
        </header>
        <div className="mt-8 w-full sm:mt-12">{children}</div>
      </div>
    </div>
  )
}
