"use client"

import type { CSSProperties } from "react"
import { ExploreThemeThumbnailGrid } from "@/components/explore-theme-thumbnails"

export type ExploreThemeMenuPanelProps = {
  theme: string | undefined
  setTheme: (value: string) => void
  shellStyle?: CSSProperties
  cornerRadius: number
}

/** Shared “Appearance / Theme” header + thumbnail grid for expandable docks. */
export function ExploreThemeMenuPanel({
  theme,
  setTheme,
  shellStyle,
  cornerRadius,
}: ExploreThemeMenuPanelProps) {
  return (
    <div className="min-w-[min(100vw-4rem,28rem)]">
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
  )
}
