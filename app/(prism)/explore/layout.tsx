import type { ReactNode } from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Explore flags",
  description: "Browse pride flags with accurate colors, history, and meaning.",
}

export default function ExploreLayout({ children }: { children: ReactNode }) {
  return children
}
