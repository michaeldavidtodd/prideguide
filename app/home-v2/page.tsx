import { Suspense } from "react"
import { HomeV2Fallback, HomeV2WelcomeContent } from "./home-v2-client"

export default function HomeV2Page() {
  return (
    <Suspense fallback={<HomeV2Fallback />}>
      <HomeV2WelcomeContent />
    </Suspense>
  )
}
