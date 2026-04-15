import type { ReactNode } from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Print shop",
  description: "Printed Pride Guide resources and stickers — coming soon. Join the interest list for each product.",
}

export default function ProductsLayout({ children }: { children: ReactNode }) {
  return children
}
