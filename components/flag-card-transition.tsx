"use client"

import type React from "react"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Flag, Share2, X } from "lucide-react"
import { AnimatedFlag } from "@/components/animated-flag"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { ShareModal } from "@/components/share-modal"

interface FlagData {
  id: string
  name: string
  description: string
  history: string
  significance: string
  category: string
  display: {
    stripes?: string[]
    svgForeground?: {
      viewBox: string
      paths: { id: string; d: string; fill: string; transform?: string; stroke?: string; strokeWidth?: string }[]
    }
  }
}

interface FlagCardTransitionProps {
  flag: FlagData | null
  onClose: () => void
  isOpen: boolean
}

export function FlagCardTransition({ flag, onClose, isOpen }: FlagCardTransitionProps) {
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareTarget, setShareTarget] = useState<Pick<FlagData, "id" | "name" | "description"> | null>(null)
  const flagBandBackground = useMemo(() => {
    const colors = flag?.display?.stripes?.filter(Boolean) ?? []
    if (colors.length === 0) {
      return "linear-gradient(90deg,#e40303 0%,#ff8c00 16.6%,#ffed00 33.3%,#008018 50%,#004cff 66.6%,#732982 83.3%,#e40303 100%)"
    }
    if (colors.length === 1) {
      return colors[0]
    }

    const step = 100 / (colors.length - 1)
    const stops = colors.map((color, index) => `${color} ${(step * index).toFixed(2)}%`).join(", ")
    return `linear-gradient(90deg, ${stops})`
  }, [flag])

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!flag) return
    setShareTarget({
      id: flag.id,
      name: flag.name,
      description: flag.description,
    })
    onClose()
    window.setTimeout(() => {
      setShowShareModal(true)
    }, 0)
  }

  return (
    <>
      <Drawer open={isOpen && !!flag} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="mx-auto max-h-[88vh] w-full max-w-2xl rounded-t-2xl">
          <DrawerHeader className="sr-only">
            <DrawerTitle>{flag?.name ?? "Flag details"}</DrawerTitle>
            <DrawerDescription>{flag?.description ?? "Flag information"}</DrawerDescription>
          </DrawerHeader>
          {flag ? (
            <div className="overflow-y-auto px-4 pb-6 pt-2 sm:px-6">
              <div className="flag-container space-y-4 pt-4 sm:pt-3">
                <div className="h-1.5 w-full rounded-full" style={{ background: flagBandBackground }} />
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Prism · flag details
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onClose}
                      className="h-9 w-9 shrink-0 rounded-full border border-border/70 bg-background/90 shadow-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      aria-label="Close flag details"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <AnimatedFlag
                    backgroundColors={flag.display.stripes || []}
                    svgForeground={flag.display.svgForeground}
                    className="w-full overflow-hidden rounded-xl"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display flex items-center gap-2 text-2xl font-extrabold tracking-tight">
                      <Flag className="h-5 w-5" />
                      {flag.name}
                    </h3>
                    <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-semibold tracking-wide">
                      {flag.category}
                    </Badge>
                  </div>
                  <p className="max-w-[68ch] text-base leading-7 text-muted-foreground">{flag.description}</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
                      <h4 className="mb-1 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-foreground/90">
                        History
                      </h4>
                      <p className="text-[0.95rem] leading-tight text-muted-foreground">{flag.history}</p>
                    </div>
                    <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
                      <h4 className="mb-1 text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-foreground/90">
                        Significance
                      </h4>
                      <p className="text-[0.95rem] leading-tight text-muted-foreground">{flag.significance}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t pt-4">
                    <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">Share this flag</p>
                    <Button size="sm" variant="outline" onClick={handleShare}>
                      <Share2 className="mr-1 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </DrawerContent>
      </Drawer>
      {shareTarget ? (
        <ShareModal
          key="flag-share-modal"
          flag={shareTarget}
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false)
            setShareTarget(null)
          }}
        />
      ) : null}
    </>
  )
}
