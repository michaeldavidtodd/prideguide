"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { getPrismLearnDockLinkTabs } from "@/lib/prism-nav"
import { cn } from "@/lib/utils"

/** Top site chrome used on Explore and Prism learn pages (`site-header` in globals.css). */
export function ExploreSiteHeader() {
  const pathname = usePathname()
  const sectionLinks = getPrismLearnDockLinkTabs()

  return (
    <header data-slot="site-header" className="site-header">
      <div className="flex w-full min-w-0 items-center justify-between gap-3 sm:gap-4">
        <Link
          data-slot="site-header-brand"
          href="/"
          className="site-header-brand group flex min-w-0 shrink-0 items-center gap-2.5 outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="Pride Guide home"
        >
          <Image
            src="/favicon.png"
            alt=""
            width={36}
            height={36}
            className="size-9 shrink-0 rounded-sm object-cover"
            priority
          />
          <span className="font-display text-base font-extrabold leading-none tracking-tight text-foreground sm:text-lg">
            Pride Guide
          </span>
        </Link>

        <nav
          data-slot="site-header-nav"
          className="hidden min-w-0 items-center justify-end gap-0.5 lg:flex xl:gap-1"
          aria-label="Pride Guide pages"
        >
          {sectionLinks.map((tab) => {
            const routeActive = pathname === tab.href
            return (
              <Link
                key={tab.id}
                href={tab.href}
                aria-current={routeActive ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-1.5 rounded-md px-2 py-2 font-display text-[0.65rem] font-bold uppercase tracking-wide transition-[color,background-color] duration-200 xl:px-3 xl:text-xs",
                  routeActive
                    ? "bg-foreground text-background"
                    : "text-foreground/70 hover:bg-foreground/[0.07] hover:text-foreground dark:hover:bg-foreground/11",
                )}
              >
                <span className="[&_svg]:size-3.5 xl:[&_svg]:size-4" aria-hidden>
                  {tab.icon}
                </span>
                {tab.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
