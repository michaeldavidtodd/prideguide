"use client"

import type { CSSProperties, ReactNode } from "react"
import { ExploreThemeThumbnailGrid } from "@/components/explore-theme-thumbnails"
import { cn } from "@/lib/utils"

export type ExploreThemeMenuPanelProps = {
  theme: string | undefined
  setTheme: (value: string) => void
  shellStyle?: CSSProperties
  cornerRadius: number
  /** Second column at `xl` (e.g. Explore studio controls). */
  secondaryColumn?: ReactNode
}

/** Shared appearance header + theme grid; optional second column for theme + studio on Explore. */
export function ExploreThemeMenuPanel({
  theme,
  setTheme,
  shellStyle,
  cornerRadius,
  secondaryColumn,
}: ExploreThemeMenuPanelProps) {
  const hasSecondary = secondaryColumn != null

  return (
    <div
      className={cn(
        "min-w-0 w-full max-w-full",
        hasSecondary && "xl:max-w-[min(100vw-2.5rem,56rem)]",
      )}
    >
      <div
        className={cn("grid gap-6", hasSecondary && "lg:grid-cols-2 lg:items-start lg:gap-10")}
      >
        <div className="min-w-0">
          <header className="space-y-1 pt-1 pb-2">
            <p className="font-display text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">
              Appearance
            </p>
            <h2 className="font-display text-lg font-extrabold leading-tight tracking-tight text-foreground">
              Theme
            </h2>
          </header>
          <ExploreThemeThumbnailGrid
            theme={theme}
            setTheme={setTheme}
            shellStyle={shellStyle}
            cornerRadius={cornerRadius}
          />
        </div>
        {hasSecondary ? (
          <div className="min-w-0 border-border/40 border-t xl:border-t-0 ">
            {secondaryColumn}
          </div>
        ) : null}
      </div>
    </div>
  )
}
