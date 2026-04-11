"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { SlidersHorizontal } from "lucide-react"
import { DockExpandingPanel } from "@/components/dock-expanding-panel"
import { cn } from "@/lib/utils"
import { getPrismLearnDockLinkTabs } from "@/lib/prism-nav"

export type PrismMobileDockProps = {
  style?: CSSProperties
  chipsSoftCorners?: boolean
  appearanceTriggerIcon: ReactNode
  themePanel: ReactNode
  studioPanel: ReactNode
}

type MobileSheet = "theme" | "studio" | "nav"

export function PrismMobileDock({
  style,
  chipsSoftCorners = false,
  appearanceTriggerIcon,
  themePanel,
  studioPanel,
}: PrismMobileDockProps) {
  const pathname = usePathname()
  const [mobileSheet, setMobileSheet] = useState<MobileSheet | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  const prefersReducedMotion = useReducedMotion()

  const linkTabs = getPrismLearnDockLinkTabs()
  const current =
    linkTabs.find((t) => t.href === pathname) ?? linkTabs[0]!

  const closeSheet = useCallback(() => setMobileSheet(null), [])

  const toggleSheet = useCallback((sheet: MobileSheet) => {
    setMobileSheet((prev) => (prev === sheet ? null : sheet))
  }, [])

  useEffect(() => {
    closeSheet()
  }, [pathname, closeSheet])

  useEffect(() => {
    if (mobileSheet === null) {
      if (triggerRef.current) {
        triggerRef.current.focus()
        triggerRef.current = null
      }
      return
    }

    triggerRef.current = document.activeElement as HTMLElement

    requestAnimationFrame(() => {
      const panel = panelRef.current
      if (!panel) return
      const first = panel.querySelector<HTMLElement>(
        'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (first) first.focus()
      else panel.focus()
    })
  }, [mobileSheet])

  useEffect(() => {
    if (mobileSheet === null) return
    const container = containerRef.current
    if (!container) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        closeSheet()
        return
      }

      if (e.key !== "Tab") return

      const focusable = container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [mobileSheet, closeSheet])

  const chipClassName = cn(
    "relative flex items-center gap-1.5 px-4 py-2",
    "font-display text-xs font-bold uppercase tracking-wide",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    "transition-[color,background-color,opacity] duration-200 ease-out",
    chipsSoftCorners && "rounded-md",
  )

  const chipIdleClass =
    "text-foreground/70 hover:text-foreground hover:bg-foreground/[0.07] dark:hover:bg-foreground/11"
  const chipActiveClass = "text-background hover:opacity-95"

  const sheetOpen = mobileSheet !== null
  let panelBody: ReactNode = null
  let panelRegionLabel = "Options"
  if (mobileSheet === "nav") {
    panelRegionLabel = "Prism pages"
    panelBody = (
      <nav aria-label="Prism pages" className="flex min-w-0 w-full flex-col gap-1 py-1">
        {linkTabs.map((tab) => {
          const routeActive = pathname === tab.href
          return (
            <Link
              key={tab.id}
              href={tab.href}
              aria-current={routeActive ? "page" : undefined}
              onClick={closeSheet}
              className={cn(
                "flex w-full min-w-0 items-center gap-3 rounded-md px-4 py-3.5 text-left text-base font-medium leading-snug [&_svg]:size-4 shrink-0",
                routeActive
                  ? "bg-foreground text-background"
                  : "hover:bg-foreground/[0.07] dark:hover:bg-foreground/11",
              )}
            >
              {tab.icon}
              {tab.label}
            </Link>
          )
        })}
      </nav>
    )
  } else if (mobileSheet === "theme") {
    panelRegionLabel = "Theme"
    panelBody = themePanel
  } else if (mobileSheet === "studio") {
    panelRegionLabel = "Motion and layout"
    panelBody = studioPanel
  }

  return (
    <div
      ref={containerRef}
      data-slot="dock-mobile"
      style={style}
      className={cn(
        "tab-bar inline-flex max-w-full flex-col items-center border-border/50 border-2 bg-card shadow-xl backdrop-blur-md overflow-hidden",
      )}
    >
      <DockExpandingPanel
        ref={panelRef}
        fill
        id="prism-mobile-dock-panel"
        role="region"
        aria-label={panelRegionLabel}
        tabIndex={sheetOpen ? -1 : undefined}
        aria-hidden={!sheetOpen}
        open={sheetOpen && panelBody != null}
        measureKey={mobileSheet}
        onClose={closeSheet}
        motionContentKey={mobileSheet ?? "closed"}
        withBackdrop
      >
        {panelBody}
      </DockExpandingPanel>

      <div
        role="navigation"
        aria-label="Prism dock"
        className="flex w-full shrink-0 items-center justify-between gap-2 px-3 py-2.5 sm:gap-2"
      >
        <button
          type="button"
          aria-label={`Current page: ${current.label}. Open page menu.`}
          aria-expanded={mobileSheet === "nav"}
          aria-controls="prism-mobile-dock-panel"
          onClick={() => toggleSheet("nav")}
          className={cn(
            chipClassName,
            mobileSheet === "nav" ? chipActiveClass : chipIdleClass,
            "min-w-0 max-w-[min(100%,14rem)] flex-1 justify-start sm:max-w-[16rem]",
          )}
        >
          <AnimatePresence>
            {mobileSheet === "nav" ? (
              <motion.span
                key="nav-pill"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
                className="absolute inset-0 bg-foreground"
                style={style}
              />
            ) : null}
          </AnimatePresence>
          <span className="relative z-10 flex min-w-0 items-center gap-1.5">
            {current.icon}
            <span className="truncate">{current.label}</span>
          </span>
        </button>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            aria-label="Motion and layout"
            aria-expanded={mobileSheet === "studio"}
            aria-controls="prism-mobile-dock-panel"
            onClick={() => toggleSheet("studio")}
            className={cn(chipClassName, mobileSheet === "studio" ? chipActiveClass : chipIdleClass)}
          >
            <AnimatePresence>
              {mobileSheet === "studio" ? (
                <motion.span
                  key="studio-pill"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
                  className="absolute inset-0 bg-foreground"
                  style={style}
                />
              ) : null}
            </AnimatePresence>
            <span className="relative z-10 flex items-center">
              <SlidersHorizontal className="size-3.5" aria-hidden />
            </span>
          </button>
          <button
            type="button"
            aria-label="Theme"
            aria-expanded={mobileSheet === "theme"}
            aria-controls="prism-mobile-dock-panel"
            onClick={() => toggleSheet("theme")}
            className={cn(chipClassName, mobileSheet === "theme" ? chipActiveClass : chipIdleClass)}
          >
            <AnimatePresence>
              {mobileSheet === "theme" ? (
                <motion.span
                  key="theme-pill"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
                  className="absolute inset-0 bg-foreground"
                  style={style}
                />
              ) : null}
            </AnimatePresence>
            <span className="relative z-10 flex items-center">{appearanceTriggerIcon}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
