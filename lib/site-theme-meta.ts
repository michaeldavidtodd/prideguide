import { Monitor, Moon, Sun, Waves, type LucideIcon } from "lucide-react"

/** Single source for site theme values, labels, and Lucide icons (dock trigger, theme toggle, etc.). */
export const SITE_THEME_OPTIONS = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "chillwave", label: "Chillwave", Icon: Waves },
  { value: "system", label: "System", Icon: Monitor },
] as const

export type SiteThemeOptionValue = (typeof SITE_THEME_OPTIONS)[number]["value"]

/**
 * Icon for the current theme in compact controls (dock tab, etc.).
 * Call only when `mounted` is true for client, or pass `mounted: false` for SSR placeholder (returns Sun).
 */
export function resolveThemeDockTriggerIcon(
  theme: string | undefined,
  mounted: boolean,
  availableThemes: string[] | undefined,
): LucideIcon {
  if (!mounted) return Sun
  const row = SITE_THEME_OPTIONS.find((t) => t.value === theme)
  if (row) return row.Icon
  if (theme === "system") {
    const resolved =
      availableThemes?.includes("light") && window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark"
    return SITE_THEME_OPTIONS.find((t) => t.value === resolved)?.Icon ?? Sun
  }
  return Sun
}
