"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { ExpandableTabBar, ExpandableTabBarDock } from "@/components/expandable-tab-bar"
import { ExploreSiteHeader } from "@/components/explore-site-header"
import { ExploreThemeMenuPanel } from "@/components/explore-theme-menu-panel"
import { StudioShellProvider, useStudioShell } from "@/components/studio-shell-context"
import { getPrismLearnDockLinkTabs } from "@/lib/prism-nav"
import { resolveThemeDockTriggerIcon } from "@/lib/site-theme-meta"

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
  return (
    <StudioShellProvider>
      <PrideLearnChromeInner
        kicker={kicker}
        title={title}
        description={description}
        wideLayout={wideLayout}
      >
        {children}
      </PrideLearnChromeInner>
    </StudioShellProvider>
  )
}

function PrideLearnChromeInner({
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
  wideLayout?: boolean
}) {
  const { theme, setTheme, themes: availableThemes } = useTheme()
  const [themeIconMounted, setThemeIconMounted] = useState(false)
  const { cornerRadius, studioShellStyle } = useStudioShell()

  useEffect(() => {
    setThemeIconMounted(true)
  }, [])

  const ThemeDockIcon = resolveThemeDockTriggerIcon(theme, themeIconMounted, availableThemes)

  return (
    <div className="home-v2-root flex min-h-dvh flex-col text-foreground">
      <ExploreSiteHeader />
      <div className="mx-auto flex min-h-0 w-full max-w-5xl flex-1 flex-col px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:px-12">
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

      <ExpandableTabBarDock>
        <ExpandableTabBar
          style={studioShellStyle}
          chipsSoftCorners={cornerRadius > 0}
          navAriaLabel="Prism pages and theme"
          panelAriaLabel="Theme"
          tabs={[
            ...getPrismLearnDockLinkTabs(),
            {
              id: "theme",
              label: "Theme",
              icon: <ThemeDockIcon className="size-3.5" aria-hidden />,
              content: (
                <ExploreThemeMenuPanel
                  theme={theme}
                  setTheme={setTheme}
                  shellStyle={studioShellStyle}
                  cornerRadius={cornerRadius}
                />
              ),
            },
          ]}
        />
      </ExpandableTabBarDock>
    </div>
  )
}
