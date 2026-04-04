import type { ReactNode } from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pride Guide",
  description: "Celebrate queer flags with history, color, and meaning—one symbol at a time.",
}

export default function HomeV2Layout({ children }: { children: ReactNode }) {
  return children
}
