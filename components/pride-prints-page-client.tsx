"use client"

import type { LucideIcon } from "lucide-react"
import { useMemo, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { BookMarked, MapPin, Sticker } from "lucide-react"
import { AnimatedFlag } from "@/components/animated-flag"
import { PrideLearnPageContent, useLearnPageIntroVariants } from "@/components/pride-learn-chrome"
import { useStudioShell } from "@/components/studio-shell-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { FlagDefinition } from "@/lib/flags"
import { PRIDE_FLAGS } from "@/lib/flags"
import { cn } from "@/lib/utils"

/** Sticker card: export asset from `public/images/flag-sticker.svg`. Switch to `"animated-flag"` for the in-app paused `AnimatedFlag` preview. */
const STICKER_PREVIEW_MODE: "svg-asset" | "animated-flag" = "svg-asset"
const FLAG_STICKER_IMAGE_PATH = "/images/flag-sticker.svg" as const

type PrintProductId = "atlanta-resource-guide" | "queer-flag-guide" | "animated-flag-stickers"

type PrintProduct = {
  id: PrintProductId
  title: string
  description: string
  Icon: LucideIcon
}

const PRINT_PRODUCTS: readonly PrintProduct[] = [
  {
    id: "atlanta-resource-guide",
    title: "Atlanta queer resource guide",
    description:
      "A pocket-sized queer resource guide focused on Atlanta, Georgia — organizations, mutual aid, health, safety, and community entry points in one place.",
    Icon: MapPin,
  },
  {
    id: "queer-flag-guide",
    title: "Queer flag guide",
    description:
      "A printed companion to flag meanings, color symbolism, and historical context — all in a convenient pocket-sized format.",
    Icon: BookMarked,
  },
  {
    id: "animated-flag-stickers",
    title: "Flag Stickers",
    description:
      "Sticker sheets inspired by the same waving-column animation you see in the guide — tactile pride you can put on a laptop, water bottle, or notebook.",
    Icon: Sticker,
  },
]

function stickerPreviewFlag(): FlagDefinition {
  const progress = PRIDE_FLAGS.find((f) => f.id === "progress")
  return progress ?? PRIDE_FLAGS[0]!
}

function ProductInterestForm({ productId, productTitle }: { productId: PrintProductId; productTitle: string }) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  const inputId = `print-interest-${productId}`

  return (
    <div className="border-t border-foreground/10 pt-5">
      {submitted ? (
        <p className="text-sm leading-relaxed text-muted-foreground" role="status">
          You&apos;re on the list for {productTitle}. We&apos;ll reach out when it&apos;s ready — no checkout yet,
          just a heads-up.
        </p>
      ) : (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            setError(null)
            const trimmed = email.trim()
            if (!trimmed) {
              setError("Add your email so we can notify you.")
              return
            }
            const input = document.getElementById(inputId) as HTMLInputElement | null
            if (input && !input.checkValidity()) {
              setError("That doesn't look like a valid email.")
              return
            }
            setSubmitted(true)
          }}
          aria-label={`Get notified when ${productTitle} is available`}
        >
          <div className="space-y-2">
            <Label htmlFor={inputId} className="text-muted-foreground">
              Email for updates
            </Label>
            <Input
              id={inputId}
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={(ev) => {
                setEmail(ev.target.value)
                if (error) setError(null)
              }}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${inputId}-error` : undefined}
            />
            {error ? (
              <p id={`${inputId}-error`} className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
          </div>
          <Button type="submit" className="w-full sm:w-auto">
            Notify me
          </Button>
        </form>
      )}
    </div>
  )
}

export function PridePrintsPageClient() {
  const { cornerRadius, studioShellStyle } = useStudioShell()
  const { itemVariants } = useLearnPageIntroVariants()
  const stickerFlag = useMemo(() => stickerPreviewFlag(), [])

  return (
    <PrideLearnPageContent
      kicker="Prism · print shop"
      title="Printed Pride Guide"
      description="Small-batch print pieces and stickers from the project. Everything here is coming soon — leave your email per item if you want a ping when we open orders."
      introAnimation
      introBodyStagger
      wideLayout
    >
      <motion.div variants={itemVariants} className="w-full">
        <div className="grid w-full gap-6 lg:grid-cols-3 lg:gap-8">
          {PRINT_PRODUCTS.map((product) => (
            <Card
              key={product.id}
              className={cn(
                "flex h-full flex-col border-foreground/15 bg-background/40 shadow-none",
                cornerRadius <= 0 && "rounded-none",
              )}
              style={studioShellStyle}
            >
              <CardHeader className="space-y-3 pb-2">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <CardTitle className="flex items-start gap-2.5 font-display text-lg font-bold leading-tight tracking-tight sm:text-xl">
                    <product.Icon className="mt-0.5 size-6 shrink-0 opacity-80" aria-hidden />
                    <span>{product.title}</span>
                  </CardTitle>
                  <Badge variant="secondary" className="shrink-0 font-display text-[0.65rem] uppercase tracking-wider">
                    Coming soon
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-5 pt-0">
                {product.id === "animated-flag-stickers" ? (
                  <div
                    className={cn(
                      "flag-bounds w-full overflow-hidden rounded-xl border border-foreground/10 bg-background/30 px-4 py-5 sm:px-6 sm:py-7",
                      STICKER_PREVIEW_MODE === "svg-asset" ? "aspect-243/188" : "aspect-[3/2.3]",
                    )}
                  >
                    <div
                      className="grid min-h-0 w-full place-items-center"
                      role="img"
                      aria-label={
                        STICKER_PREVIEW_MODE === "svg-asset"
                          ? "Sticker artwork: Progress Pride flag with vertical wave strips"
                          : `Preview: ${stickerFlag.name}`
                      }
                    >
                      {STICKER_PREVIEW_MODE === "svg-asset" ? (
                        <Image
                          src={FLAG_STICKER_IMAGE_PATH}
                          alt=""
                          width={259}
                          height={204}
                          unoptimized
                          className="h-auto max-h-[min(88cqh,100%)] w-full max-w-full m-auto object-contain drop-shadow-[0_8px_28px_hsl(var(--foreground)/0.12)]"
                        />
                      ) : (
                        <AnimatedFlag
                          backgroundColors={stickerFlag.display.stripes ?? []}
                          svgForeground={stickerFlag.display.svgForeground}
                          fit="contain"
                          numOfColumns={16}
                          staggeredDelay={150}
                          billow={0.75}
                          motionless
                          className="w-auto! max-h-[min(68cqh,100%)] max-w-[min(100%,96cqi)] shrink-0 drop-shadow-[0_8px_28px_hsl(var(--foreground)/0.12)]!"
                        />
                      )}
                    </div>
                  </div>
                ) : null}
                <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {product.description}
                </p>
                <div className="mt-auto">
                  <ProductInterestForm productId={product.id} productTitle={product.title} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </PrideLearnPageContent>
  )
}
