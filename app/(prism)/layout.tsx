"use client"

import type { ReactNode } from "react"
import { ExploreSiteHeader } from "@/components/explore-site-header"
import { StudioShellProvider } from "@/components/studio-shell-context"

export default function PrismGroupLayout({ children }: { children: ReactNode }) {
  return (
    <StudioShellProvider>
      <div className="home-v2-root flex min-h-dvh flex-col text-foreground">
        <ExploreSiteHeader />
        {children}
      </div>
    </StudioShellProvider>
  )
}
