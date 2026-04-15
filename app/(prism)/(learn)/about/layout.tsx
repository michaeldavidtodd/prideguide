import type { ReactNode } from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "About",
  description: "About Pride Guide.",
}

export default function AboutAppLayout({ children }: { children: ReactNode }) {
  return children
}
