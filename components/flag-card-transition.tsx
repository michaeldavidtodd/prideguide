"use client"

import type React from "react"

import { Fragment, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Flag, Share2, X } from "lucide-react"
import { AnimatedFlag } from "@/components/animated-flag"
import { ShareModal } from "@/components/share-modal"
import { useToast } from "@/hooks/use-toast"

interface FlagCardTransitionProps {
  flag: any
  cardRect: DOMRect | null
  onClose: () => void
  isOpen: boolean
}

export function FlagCardTransition({ flag, cardRect, onClose, isOpen }: FlagCardTransitionProps) {
  const [animationPhase, setAnimationPhase] = useState<"scaling" | "content" | "closing">("scaling")
  const [showShareModal, setShowShareModal] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen && cardRect) {
      setAnimationPhase("scaling")
      const timer = setTimeout(() => {
        setAnimationPhase("content")
      }, 400)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [isOpen, cardRect])

  const handleClose = () => {
    setAnimationPhase("closing")
    setTimeout(() => {
      onClose()
      setAnimationPhase("scaling")
    }, 800)
  }

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowShareModal(true)
  }

  if (!isOpen || !cardRect || !flag) {
    return null
  }

  const centerX = window.innerWidth / 2
  const centerY = window.innerHeight / 2
  const dialogWidth = Math.min(500, window.innerWidth - 32)
  const dialogHeight = Math.min(600, window.innerHeight - 32)
  const phase: "scaling" | "content" | "closing" = animationPhase

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment key="flag-card-overlay">
          {/* Backdrop */}
          <motion.div
            key="flag-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === "closing" ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />

          {/* Close button - positioned relative to the animated card container */}
          <motion.div
            key="flag-close"
            initial={{ opacity: 0 }}
            animate={{
              opacity: phase === "content" ? 1 : 0,
            }}
            transition={{
              duration: phase === "closing" ? 0.2 : 0.3,
              delay: phase === "closing" ? 0 : 0.2,
            }}
            className="fixed z-50"
            style={{
              left: phase === "closing" ? cardRect.left + cardRect.width - 40 : centerX + dialogWidth / 2 - 40,
              top: phase === "closing" ? cardRect.top + 8 : centerY - dialogHeight / 2 + 8,
            }}
          >
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </motion.div>

          {/* Animated Card - EXACT COPY OF ORIGINAL */}
          <motion.div
            key="flag-dialog"
            className="fixed z-50 pointer-events-auto"
            initial={{
              left: cardRect.left,
              top: cardRect.top,
              width: cardRect.width,
              height: cardRect.height,
            }}
            animate={{
              left: phase === "closing" ? cardRect.left : centerX - dialogWidth / 2,
              top: phase === "closing" ? cardRect.top : centerY - dialogHeight / 2,
              width: phase === "closing" ? cardRect.width : dialogWidth,
              height: phase === "closing" ? cardRect.height : "auto",
            }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flag-container">
              <CardHeader className="pb-2">
                <AnimatedFlag
                  backgroundColors={flag.display.stripes || []}
                  svgForeground={flag.display.svgForeground}
                  className="h-24 rounded-lg overflow-hidden mb-2"
                />
                <CardTitle className="text-lg flex items-center gap-2">
                  <Flag className="w-5 h-5" />
                  {flag.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">{flag.description}</p>

                {/* Additional content - zero height when collapsed */}
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: phase === "content" ? "auto" : 0,
                    opacity: phase === "content" ? 1 : 0,
                  }}
                  transition={{
                    duration: 0.4,
                    delay: phase === "closing" ? 0 : 0.2,
                  }}
                  className="overflow-hidden"
                  style={{
                    marginBottom: phase === "content" ? "8px" : "0px",
                  }}
                >
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-1">History</h4>
                      <p className="text-sm text-muted-foreground">{flag.history}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">Significance</h4>
                      <p className="text-sm text-muted-foreground">{flag.significance}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Card footer with badge and share button - consistent height */}
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{flag.category}</Badge>

                  {/* Share button - always present but invisible/non-interactive in card state */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleShare}
                    style={{
                      opacity: phase === "content" ? 1 : 0,
                      pointerEvents: phase === "content" ? "auto" : "none",
                    }}
                  >
                    <Share2 className="w-4 h-4 mr-1" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Fragment>
      )}
      {/* Share Modal - now shows on all devices */}
      <ShareModal
        key="flag-share-modal"
        flag={flag}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </AnimatePresence>
  )
}
