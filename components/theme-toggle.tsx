"use client"

import { useState, useEffect, useRef } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Monitor, Check } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className="w-9 h-9">
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  const themes = [
    {
      name: "Light",
      value: "light",
      icon: Sun,
    },
    {
      name: "Dark",
      value: "dark",
      icon: Moon,
    },
    {
      name: "System",
      value: "system",
      icon: Monitor,
    },
  ]

  const getCurrentIcon = () => {
    const currentTheme = themes.find((t) => t.value === theme)
    return currentTheme ? currentTheme.icon : Sun
  }

  const CurrentIcon = getCurrentIcon()

  const handleThemeSelect = (themeValue: string) => {
    setTheme(themeValue)
    // Don't close the popover automatically
  }

  return (
    <div className="relative" ref={popoverRef}>
      <Button variant="outline" size="icon" className="w-9 h-9" onClick={() => setIsOpen(!isOpen)}>
        <CurrentIcon className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 shadow-xl z-50 p-3">
          <div className="space-y-1">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon
              const isActive = theme === themeOption.value

              return (
                <button
                  key={themeOption.value}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm rounded-md transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent"
                  }`}
                  onClick={() => handleThemeSelect(themeOption.value)}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{themeOption.name}</span>
                  </div>
                  {isActive && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
