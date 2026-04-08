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
 *   tab again closes it (toggle).
 * - **Mouse / fine pointer**: hovering a tab opens its panel instantly; moving
 *   the cursor away schedules a 260 ms close (cancelled if the cursor re-enters).
 * - **Keyboard**: Escape closes the panel. Tab/Shift-Tab cycle within the
 *   component while a panel is open (focus trap). Focus moves into the panel
 *   on open and returns to the triggering tab on close.
 *
 * Animation:
 * - Content area height is animated via CSS transition on a measured pixel value
 *   (not Framer Motion `layout` / scale transforms) so borders and shadows
 *   resize cleanly without distortion.
 * - The active-tab pill fades in/out via Framer Motion `AnimatePresence`.
 * - A translucent backdrop fades in when the menu is open.
 * - All animations are suppressed when the user prefers reduced motion.
 *
 * Accessibility:
 * - ARIA `tablist` / `tab` / `tabpanel` roles with `aria-selected`,
 *   `aria-controls`, and `aria-labelledby` relationships.
 * - `aria-label` on each tab button ensures screen reader names on mobile
 *   where visual labels are hidden.
 * - Body scroll is locked while a panel is open.
 */
export function ExpandableTabBar({ tabs, className, style }: ExpandableTabBarProps) {
  const [activeTab, setActiveTab] = useState<string | null>(null)
  const [hasPointerFine, setHasPointerFine] = useState(false)
  const prefersReducedMotion = useReducedMotion()
  const hoverCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)

  useEffect(() => {
    if (activeTab === null) {
      setContentHeight(0)
      return
    }
    requestAnimationFrame(() => {
      if (measureRef.current) {
        setContentHeight(measureRef.current.scrollHeight)
      }
    })
  }, [activeTab])

  useEffect(() => {
    if (activeTab !== null) {
      document.body.style.overflow = "hidden"
      return () => { document.body.style.overflow = "" }
    }
  }, [activeTab])

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
      if (!hasPointerFine && activeTab === id) {
        setActiveTab(null)
      } else {
        setActiveTab(id)
      }
    },
    [clearHoverTimer, hasPointerFine, activeTab],
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

  const handleClose = useCallback(() => {
    clearHoverTimer()
    setActiveTab(null)
  }, [clearHoverTimer])

  const triggerRef = useRef<HTMLElement | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (activeTab === null) {
      if (triggerRef.current) {
        triggerRef.current.focus()
        triggerRef.current = null
      }
      return
    }

    triggerRef.current = document.activeElement as HTMLElement

    requestAnimationFrame(() => {
      const panel = panelRef.current
      if (panel) {
        const first = panel.querySelector<HTMLElement>(
          'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (first) first.focus()
        else panel.focus()
      }
    })
  }, [activeTab])

  useEffect(() => {
    if (activeTab === null) return
    const container = containerRef.current
    if (!container) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault()
        handleClose()
        return
      }

      if (e.key !== "Tab") return

      const focusable = container.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
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
  }, [activeTab, handleClose])

  return (
    <div className={cn("inline-flex flex-col items-center", className)}>
      <AnimatePresence>
        {activeTab !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.15 }}
            className="fixed inset-0 z-[-1] bg-background/40"
            onClick={handleClose}
            aria-hidden
          />
        )}
      </AnimatePresence>
      <div
        ref={containerRef}
        style={style}
        className={cn(
          "border border-border/50 bg-card shadow-xl",
          "backdrop-blur-md overflow-hidden",
        )}
        onMouseLeave={handleContainerLeave}
      >
        <div
          ref={panelRef}
          id="expandable-tab-panel"
          role="tabpanel"
          tabIndex={activeTab !== null ? -1 : undefined}
          aria-labelledby={activeTab ? `tab-${activeTab}` : undefined}
          style={{
            height: contentHeight,
            transition: prefersReducedMotion ? "none" : "height 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)",
          }}
          className="overflow-hidden"
        >
          <div ref={measureRef}>
            <AnimatePresence initial={false} mode="popLayout">
              {activeTab !== null && activeContent && (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.15 }}
                  className="px-5 pt-3"
                >
                  {activeContent}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div role="tablist" className="flex shrink-0 items-center gap-1.5 px-3 py-2.5 sm:gap-2">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="expandable-tab-panel"
                aria-label={tab.label}
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
                  <span className="hidden sm:inline" aria-hidden="true">{tab.label}</span>
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
