import type { ReactNode } from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Print Shop",
  description: "Printed Pride Guide resources and stickers — coming soon. Join the interest list for each product.",
}

export default function PrintShopLayout({ children }: { children: ReactNode }) {
  return children
}
