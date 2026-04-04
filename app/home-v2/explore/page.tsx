import { Suspense } from "react"
import { HomeV2ExploreContent, HomeV2Fallback } from "../home-v2-client"

export default function HomeV2ExplorePage() {
  return (
    <Suspense fallback={<HomeV2Fallback />}>
      <HomeV2ExploreContent />
    </Suspense>
  )
}
