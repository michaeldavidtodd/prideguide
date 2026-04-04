import type { ReactNode } from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Classic layout",
  description: "Original single-page Pride Guide with carousel, tabs, and filters.",
}

export default function ClassicLayout({ children }: { children: ReactNode }) {
  return children
}
