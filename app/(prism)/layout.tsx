"use client"

import type { ReactNode } from "react"
import { ExploreSiteHeader } from "@/components/explore-site-header"
import { StudioShellProvider } from "@/components/studio-shell-context"

export default function PrismGroupLayout({ children }: { children: ReactNode }) {
  return (
    <StudioShellProvider>
      <div className="home-v2-root flex min-h-dvh flex-col text-foreground">
        <ExploreSiteHeader />
        {/* xl+: flex-1 fills viewport so explore grid / h-full resolve. Below xl: no flex-1 — wrapper is content-height so the document scrolls. */}
        <div className="flex w-full flex-col xl:min-h-0 xl:flex-1">{children}</div>
      </div>
    </StudioShellProvider>
  )
}
