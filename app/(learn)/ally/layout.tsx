import type { ReactNode } from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Ally guide",
  description: "How to be a supportive LGBTQIA+ ally.",
}

export default function AllyLayout({ children }: { children: ReactNode }) {
  return children
}
