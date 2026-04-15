"use client"

import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react"
import { Keyboard, SlidersHorizontal } from "lucide-react"
import { ExpandableTabBar, ExpandableTabBarDock } from "@/components/expandable-tab-bar"
import { PrismMobileDock } from "@/components/prism-mobile-dock"
import { useMediaQuery } from "@/hooks/use-media-query"
const XL_MEDIA = "(min-width: 1280px)"
/** Below Tailwind `lg` — two-bar mobile Prism dock. */
export const LG_MAX_DOCK_MEDIA_QUERY = "(max-width: 1023px)"

export type PrismExpandableDockProps = {
  style?: CSSProperties
  chipsSoftCorners?: boolean
  /** Dynamic theme trigger (sun/moon/system) from `resolveThemeDockTriggerIcon`. */
  appearanceTriggerIcon: ReactNode
  /** Theme panel (color mode, etc.). */
  themePanel: ReactNode
  /** Motion, layout, and related studio controls. */
  studioPanel: ReactNode
  /**
   * When provided (including `null` to omit on some routes), a Shortcuts tab is shown
   * only at the `xl` breakpoint and up. Omit the prop entirely when shortcuts are N/A.
   */
  shortcutsPanel?: ReactNode | null
  dockProps?: Omit<ComponentPropsWithoutRef<typeof ExpandableTabBarDock>, "children">
}

/**
 * Shared bottom dock: below `lg`, section links + options use the mobile dock; from `lg` up,
 * section links live in the fixed site header (`ExploreSiteHeader`) and this dock is utilities
 * only (Shortcuts from `xl`, Theme, Layout).
 */
export function PrismExpandableDock({
  style,
  chipsSoftCorners,
  appearanceTriggerIcon,
  themePanel,
  studioPanel,
  shortcutsPanel,
  dockProps,
}: PrismExpandableDockProps) {
  const showShortcutsTab = useMediaQuery(XL_MEDIA)
  const mobileDock = useMediaQuery(LG_MAX_DOCK_MEDIA_QUERY)

  const panelTabs = []

  if (shortcutsPanel != null && showShortcutsTab) {
    panelTabs.push({
      id: "keyboard",
      label: "Shortcuts",
      icon: <Keyboard className="size-3.5" aria-hidden />,
      content: shortcutsPanel,
    })
  }

  panelTabs.push(
    {
      id: "theme",
      label: "Theme",
      icon: appearanceTriggerIcon,
      content: themePanel,
    },
    {
      id: "layout",
      label: "Layout",
      icon: <SlidersHorizontal className="size-3.5" aria-hidden />,
      content: studioPanel,
    },
  )

  const desktopUtilityNavLabel =
    shortcutsPanel != null && showShortcutsTab ? "Shortcuts, theme, and layout" : "Theme and layout"

  return (
    <ExpandableTabBarDock {...dockProps}>
      {mobileDock ? (
        <PrismMobileDock
          style={style}
          chipsSoftCorners={chipsSoftCorners}
          appearanceTriggerIcon={appearanceTriggerIcon}
          themePanel={themePanel}
          studioPanel={studioPanel}
        />
      ) : (
        <ExpandableTabBar
          style={style}
          chipsSoftCorners={chipsSoftCorners}
          navAriaLabel={desktopUtilityNavLabel}
          panelAriaLabel="Theme and layout options"
          tabs={panelTabs}
        />
      )}
    </ExpandableTabBarDock>
  )
}
