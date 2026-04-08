import type { ReactNode } from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Quiz",
  description: "Test your knowledge of LGBTQIA+ pride flags.",
}

export default function QuizLayout({ children }: { children: ReactNode }) {
  return children
}
