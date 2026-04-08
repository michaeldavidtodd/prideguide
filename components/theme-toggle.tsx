"use client"

import { useState, useEffect, type CSSProperties } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, Sun } from "lucide-react"
import { SITE_THEME_OPTIONS, resolveThemeDockTriggerIcon } from "@/lib/site-theme-meta"
import { cn } from "@/lib/utils"

export type ThemeToggleProps = {
  className?: string
  style?: CSSProperties
}

export function ThemeToggle({ className, style }: ThemeToggleProps = {}) {
  const { theme, setTheme, themes: availableThemes } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className={cn("h-9 w-9", className)} style={style}>
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  const CurrentIcon = resolveThemeDockTriggerIcon(theme, mounted, availableThemes)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className={cn("h-9 w-9", className)} style={style} type="button">
          <CurrentIcon className="h-4 w-4" />
          <span className="sr-only">Theme</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" side="bottom" sideOffset={8} className="w-48 p-3">
        <div className="space-y-1">
          {SITE_THEME_OPTIONS.map((themeOption) => {
            const Icon = themeOption.Icon
            const isActive = theme === themeOption.value
            return (
              <button
                key={themeOption.value}
                type="button"
                className={cn(
                  "flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-sm transition-colors",
                  isActive
                    ? "border-primary/45 bg-primary/15 text-primary"
                    : "border-transparent hover:bg-accent/60"
                )}
                onClick={() => setTheme(themeOption.value)}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{themeOption.label}</span>
                </span>
                {isActive ? <Check className="h-4 w-4" aria-hidden /> : null}
              </button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
