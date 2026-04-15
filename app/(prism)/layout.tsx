"use client"

import type { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { ExploreSiteHeader } from "@/components/explore-site-header"

export default function PrismGroupLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()

  return (
    <div data-slot="layout" data-page={pathname}>
      <ExploreSiteHeader />
      {/* xl+: flex-1 fills viewport so explore grid / h-full resolve. Below xl: no flex-1 — wrapper is content-height so the document scrolls. */}
      <div data-slot="layout-body">{children}</div>
    </div>
  )
}
