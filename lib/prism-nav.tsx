import type { LucideIcon } from "lucide-react"
import { BookOpen, ClipboardList, Heart, House, Info, ShoppingBag, Telescope, Trophy } from "lucide-react"
import type { ExpandableTabBarLinkItem } from "@/components/expandable-tab-bar"
import {
  PRIDE_ABOUT_APP_PATH,
  PRIDE_ALLY_PATH,
  PRIDE_EXPLORE_PATH,
  PRIDE_PRINTS_PATH,
  PRIDE_QUIZ_PATH,
} from "@/lib/pride-routes"

function prismDockIcon(Icon: LucideIcon) {
  return <Icon className="size-3.5" aria-hidden />
}

type PrismAppSection = {
  id: string
  href: string
  dock: { label: string; Icon: LucideIcon }
  /** Shown in Explore “More” grid (Explore itself is omitted — you’re already there). */
  moreGrid?: { label: string; Icon: LucideIcon }
}

/**
 * Prism app areas: learn dock links and (subset) Explore More grid entries share `href`;
 * labels/icons can differ per surface.
 */
export const PRISM_APP_SECTIONS: readonly PrismAppSection[] = [
  {
    id: "explore",
    href: PRIDE_EXPLORE_PATH,
    dock: { label: "Explore", Icon: Telescope },
  },
  {
    id: "quiz",
    href: PRIDE_QUIZ_PATH,
    dock: { label: "Quiz", Icon: ClipboardList },
    moreGrid: { label: "Quiz", Icon: Trophy },
  },
  {
    id: "ally",
    href: PRIDE_ALLY_PATH,
    dock: { label: "Ally guide", Icon: Heart },
    moreGrid: { label: "Ally guide", Icon: Heart },
  },
  {
    id: "about",
    href: PRIDE_ABOUT_APP_PATH,
    dock: { label: "About", Icon: BookOpen },
    moreGrid: { label: "About app", Icon: Info },
  },
  {
    id: "products",
    href: PRIDE_PRINTS_PATH,
    dock: { label: "Prints", Icon: ShoppingBag },
    moreGrid: { label: "Print shop", Icon: ShoppingBag },
  },
]

export type PrismExploreMoreGridItem = {
  href: string
  label: string
  Icon: LucideIcon
}

export function getPrismLearnDockLinkTabs(): ExpandableTabBarLinkItem[] {
  return PRISM_APP_SECTIONS.map((s) => ({
    id: s.id,
    href: s.href,
    label: s.dock.label,
    icon: prismDockIcon(s.dock.Icon),
  }))
}

export function getPrismExploreMoreGridItems(): PrismExploreMoreGridItem[] {
  const fromSections: PrismExploreMoreGridItem[] = []
  for (const s of PRISM_APP_SECTIONS) {
    if (s.moreGrid) {
      fromSections.push({
        href: s.href,
        label: s.moreGrid.label,
        Icon: s.moreGrid.Icon,
      })
    }
  }
  return [{ href: "/", label: "Home", Icon: House }, ...fromSections]
}
