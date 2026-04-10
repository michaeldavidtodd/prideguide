"use client"

import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react"
import { Keyboard } from "lucide-react"
import { ExpandableTabBar, ExpandableTabBarDock } from "@/components/expandable-tab-bar"
import { useMediaQuery } from "@/hooks/use-media-query"
import { getPrismLearnDockLinkTabs } from "@/lib/prism-nav"

const XL_MEDIA = "(min-width: 1280px)"

export type PrismExpandableDockProps = {
  style?: CSSProperties
  chipsSoftCorners?: boolean
  /** Dynamic theme trigger (sun/moon/system) from `resolveThemeDockTriggerIcon`. */
  appearanceTriggerIcon: ReactNode
  /** Theme + optional studio column; built with `ExploreAppearanceMenuPanel`. */
  appearancePanel: ReactNode
  /**
   * When provided (including `null` to omit on some routes), a Shortcuts tab is shown
   * only at the `xl` breakpoint and up. Omit the prop entirely when shortcuts are N/A.
   */
  shortcutsPanel?: ReactNode | null
  dockProps?: Omit<ComponentPropsWithoutRef<typeof ExpandableTabBarDock>, "children">
}

/**
 * Shared bottom dock: Prism section links, optional keyboard shortcuts (xl+), and one appearance panel.
 */
export function PrismExpandableDock({
  style,
  chipsSoftCorners,
  appearanceTriggerIcon,
  appearancePanel,
  shortcutsPanel,
  dockProps,
}: PrismExpandableDockProps) {
  const showShortcutsTab = useMediaQuery(XL_MEDIA)

  const linkTabs = getPrismLearnDockLinkTabs()
  const panelTabs = []

  if (shortcutsPanel != null && showShortcutsTab) {
    panelTabs.push({
      id: "keyboard",
      label: "Shortcuts",
      icon: <Keyboard className="size-3.5" aria-hidden />,
      content: shortcutsPanel,
    })
  }

  panelTabs.push({
    id: "appearance",
    label: "Appearance",
    icon: appearanceTriggerIcon,
    content: appearancePanel,
  })

  const tabs = [...linkTabs, ...panelTabs]

  return (
    <ExpandableTabBarDock {...dockProps}>
      <ExpandableTabBar
        style={style}
        chipsSoftCorners={chipsSoftCorners}
        navAriaLabel="Prism pages and appearance"
        panelAriaLabel="Appearance and options"
        tabs={tabs}
      />
    </ExpandableTabBarDock>
  )
}
