import type { ReactNode } from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Focus · Pride Guide",
  description: "Experimental single-flag explorer for Pride Guide.",
}

export default function HomeV2Layout({ children }: { children: ReactNode }) {
  return children
}
