"use client"

import Image from "next/image"
import Link from "next/link"

/** Top site chrome used on Explore and Prism learn pages (`site-header` in globals.css). */
export function ExploreSiteHeader() {
  return (
    <header data-slot="site-header" className="site-header">
      <Link
        data-slot="site-header-brand"
        href="/"
        className="site-header-brand group flex shrink-0 items-center gap-2.5 outline-none transition-opacity hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label="Pride Guide home"
      >
        <Image
          src="/favicon.png"
          alt=""
          width={36}
          height={36}
          className="size-9 shrink-0 rounded-sm object-cover"
          priority
        />
        <span className="font-display text-base font-extrabold leading-none tracking-tight text-foreground sm:text-lg">
          Pride Guide
        </span>
      </Link>
    </header>
  )
}
