import { Suspense } from "react"
import type { Metadata } from "next"
import { HomeV2Fallback, HomeV2WelcomeContent } from "@/components/pride-home-client"

export const metadata: Metadata = {
  title: "Pride Guide",
  description: "Celebrate queer flags with history, color, and meaning—one symbol at a time.",
}

export default function HomePage() {
  return (
    <Suspense fallback={<HomeV2Fallback />}>
      <HomeV2WelcomeContent />
    </Suspense>
  )
}
