"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

/** A single tab definition for the expandable tab bar. */
interface TabItem {
  /** Stable key used for state tracking and AnimatePresence keying. */
  id: string
  /** Visible label (hidden on small screens, shown on sm+). */
  label: string
  /** Icon element rendered beside the label. */
  icon: ReactNode
  /** Panel content revealed when this tab is active. */
  content: ReactNode
}

interface ExpandableTabBarProps {
  /** Ordered list of tabs to render. */
  tabs: TabItem[]
  /** Extra classes applied to the outermost wrapper (positioning, z-index, etc.). */
  className?: string
  /**
   * Passed as inline `style` to the animated container and the active-tab pill.
   * Typically used to propagate dynamic border-radius from a parent "shell style."
   */
  style?: CSSProperties
}

/**
 * Bottom tab bar that expands upward to reveal panel content.
 *
 * Interaction model:
 * - **Touch / coarse pointer**: tap a tab to open its panel. Tapping the same
 *   tab again keeps it open (no toggle-close).
 * - **Mouse / fine pointer**: hovering a tab opens its panel instantly; moving
 *   the cursor away schedules a 260 ms close (cancelled if the cursor re-enters).
 *
 * Animation:
 * - The outer container uses Framer Motion `layout` with a spring transition so
 *   height changes between panels are fluid, not abrupt.
 * - Panel crossfades use `AnimatePresence mode="popLayout"` for overlapping
 *   exit/enter without collapsing to zero height.
 * - The tab button row uses `layout="position"` so it stays pinned at its
 *   natural size while the container resizes.
 * - The active-tab pill fades in/out rather than sliding (avoids jarring motion
 *   when the container height is also animating).
 * - All animations are suppressed when the user prefers reduced motion.
 */
export function ExpandableTabBar({ tabs, className, style }: ExpandableTabBarProps) {
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [hasPointerFine, setHasPointerFine] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const hoverCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)")
    const apply = () => setHasPointerFine(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  const clearHoverTimer = useCallback(() => {
    if (hoverCloseTimer.current !== null) {
      clearTimeout(hoverCloseTimer.current)
      hoverCloseTimer.current = null
    }
  }, [])

  useEffect(() => () => clearHoverTimer(), [clearHoverTimer])

  const scheduleClose = useCallback(() => {
    if (!hasPointerFine) return
    clearHoverTimer()
    hoverCloseTimer.current = setTimeout(() => {
      hoverCloseTimer.current = null
      setActiveTab(null)
    }, 260)
  }, [clearHoverTimer, hasPointerFine])

  const handleTabClick = useCallback(
    (id: string) => {
      clearHoverTimer()
      setActiveTab(id)
    },
    [clearHoverTimer],
  )

  const handleTabHover = useCallback(
    (id: string) => {
      if (!hasPointerFine) return
      clearHoverTimer()
      setActiveTab(id)
    },
    [clearHoverTimer, hasPointerFine],
  )

  const handleContainerLeave = useCallback(
    (e: React.MouseEvent) => {
      if (!hasPointerFine) return
      const related = e.relatedTarget
      if (related instanceof Node && containerRef.current?.contains(related)) return
      scheduleClose()
    },
    [hasPointerFine, scheduleClose],
  )

  const activeContent = tabs.find((t) => t.id === activeTab)?.content

  const springTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, damping: 26, stiffness: 280 }

  return (
    <div className={cn("inline-flex flex-col items-center", className)}>
      <motion.div
        ref={containerRef}
        layout
        transition={springTransition}
        style={style}
        className={cn(
          "relative overflow-hidden",
          "border border-border/50 bg-card shadow-xl",
          "backdrop-blur-md",
        )}
        onMouseLeave={handleContainerLeave}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {activeTab !== null && activeContent && (
            <motion.div
              key={activeTab}
              layout="position"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.15 }}
            >
              <div className="px-5 pt-3">{activeContent}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab !== null && <div className="mx-4 h-px bg-border/60" />}

        <motion.div layout="position" className="flex shrink-0 items-center gap-1.5 px-3 py-2.5 sm:gap-2">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabClick(tab.id)}
                onMouseEnter={() => handleTabHover(tab.id)}
                className={cn(
                  "relative flex items-center gap-1.5 px-4 py-2",
                  "font-display text-xs font-bold uppercase tracking-wide transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "text-background"
                    : "text-foreground/70 hover:text-foreground",
                )}
              >
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
                      className="absolute inset-0 bg-foreground"
                      style={style}
                    />
                  )}
                </AnimatePresence>
                <span className="relative z-10 flex items-center gap-1.5">
                  {tab.icon}
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
              </button>
            )
          })}
        </motion.div>
      </motion.div>
    </div>
  )
}
