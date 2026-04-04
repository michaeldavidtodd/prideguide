import { Suspense } from "react"
import { HomeV2ExploreContent, HomeV2Fallback } from "@/components/pride-home-client"

export default function ExplorePage() {
  return (
    <Suspense fallback={<HomeV2Fallback />}>
      <HomeV2ExploreContent />
    </Suspense>
  )
}
