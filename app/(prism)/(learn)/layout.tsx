import type { ReactNode } from "react"
import { PrideLearnShell } from "@/components/pride-learn-chrome"

export default function LearnGroupLayout({ children }: { children: ReactNode }) {
  return <PrideLearnShell>{children}</PrideLearnShell>
}
