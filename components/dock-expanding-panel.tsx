"use client"

import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

export type DockExpandingPanelProps = {
  open: boolean
  /** Drives remeasure when content identity changes (e.g. tab id). Use null when closed. */
  measureKey: string | null
  onClose: () => void
  style?: CSSProperties
  /** Backdrop + body scroll lock (tab dock behavior). */
  withBackdrop?: boolean
  id?: string
  role?: "region" | "tabpanel"
  "aria-label"?: string
  "aria-labelledby"?: string
  "aria-hidden"?: boolean
  tabIndex?: number
  /** Key for inner motion wrapper (must change when panel body swaps). */
  motionContentKey: string
  children: ReactNode
  /** Extra classes on the measured panel (grid) wrapper. */
  panelClassName?: string
  /**
   * When true, panel spans the dock shell width (`width: 100%`); only height is measured
   * and transitioned. When false, width + height follow intrinsic content (`w-max`).
   */
  fill?: boolean
}

/**
 * Upward dock panel: measured height/width + CSS transitions, optional backdrop.
 * Shared by ExpandableTabBar and PrismMobileDock appearance sheets.
 */
export const DockExpandingPanel = forwardRef<HTMLDivElement, DockExpandingPanelProps>(
  function DockExpandingPanel(
    {
      open,
      measureKey,
      onClose,
      style,
      withBackdrop = true,
      id,
      role,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
      "aria-hidden": ariaHidden,
      tabIndex,
      motionContentKey,
      children,
      panelClassName,
      fill = false,
    },
    ref,
  ) {
  const prefersReducedMotion = useReducedMotion()
  const measureRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)
  const [contentWidth, setContentWidth] = useState<number | undefined>(undefined)

  const panelTransition = prefersReducedMotion
    ? "none"
    : fill
      ? "height 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)"
      : "height 0.35s cubic-bezier(0.25, 0.1, 0.25, 1), width 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)"

  useLayoutEffect(() => {
    if (!open || measureKey === null) {
      setContentHeight(0)
      setContentWidth(undefined)
      return
    }

    const el = measureRef.current
    if (!el) return

    const measure = () => {
      setContentHeight(Math.ceil(el.scrollHeight))
      if (!fill) {
        setContentWidth(Math.ceil(el.offsetWidth))
      }
    }

    let ro: ResizeObserver | null = null
    let raf1 = 0
    let raf2 = 0

    const attachRo = () => {
      ro = new ResizeObserver(measure)
      ro.observe(el)
    }

    const openedFromClosed = fill
      ? contentHeight === 0
      : (contentWidth === 0 || contentWidth === undefined) && contentHeight === 0

    if (openedFromClosed && !prefersReducedMotion) {
      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          measure()
          attachRo()
        })
      })
    } else {
      measure()
      attachRo()
    }

    return () => {
      cancelAnimationFrame(raf1)
      cancelAnimationFrame(raf2)
      ro?.disconnect()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- contentWidth/Height only for open-from-closed
  }, [open, measureKey, prefersReducedMotion, fill])

  useEffect(() => {
    if (!withBackdrop || !open) return
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [open, withBackdrop])

  const portaledBackdrop =
    withBackdrop ? (
      <AnimatePresence>
        {open ? (
          <motion.div
            key="dock-expanding-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.15 }}
            className="fixed inset-0 z-40"
            style={{
              background:
                "linear-gradient(to top, hsl(var(--background) / 0.5), hsl(var(--background) / 0) 70%)",
            }}
            onClick={onClose}
            aria-hidden
          />
        ) : null}
      </AnimatePresence>
    ) : null

  return (
    <>
      {withBackdrop && typeof document !== "undefined"
        ? createPortal(portaledBackdrop, document.body)
        : null}
      <div
        ref={(node) => {
          if (typeof ref === "function") ref(node)
          else if (ref) ref.current = node
        }}
        id={id}
        role={role}
        tabIndex={tabIndex}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-hidden={ariaHidden}
        style={{
          height: contentHeight,
          ...(fill ? { width: "100%" } : { width: contentWidth }),
          transition: panelTransition,
          ...style,
        }}
        className={cn(
          "grid grid-cols-1 items-start overflow-hidden",
          fill ? "min-w-0 w-full justify-items-stretch self-stretch" : "justify-items-center",
          panelClassName,
        )}
      >
        <div
          ref={measureRef}
          className={cn(fill ? "min-w-0 w-full" : "w-max")}
        >
          {open && measureKey !== null ? (
            <motion.div
              key={motionContentKey}
              initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.15 }}
              className={cn("px-5 py-3", fill && "min-w-0 w-full")}
            >
              {children}
            </motion.div>
          ) : null}
        </div>
      </div>
    </>
  )
})

DockExpandingPanel.displayName = "DockExpandingPanel"
