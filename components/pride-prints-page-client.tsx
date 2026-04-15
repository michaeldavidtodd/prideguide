"use client"

import type { LucideIcon } from "lucide-react"
import { useMemo } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { BookMarked, MapPin, Sticker } from "lucide-react"
import { AnimatedFlag } from "@/components/animated-flag"
import { PrideLearnPageContent, useLearnPageIntroVariants } from "@/components/pride-learn-chrome"
import { useStudioShell } from "@/components/studio-shell-context"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import type { FlagDefinition } from "@/lib/flags"
import { PRIDE_FLAGS } from "@/lib/flags"
import { cn } from "@/lib/utils"

/** Sticker card: export asset from `public/images/flag-sticker.svg`. Switch to `"animated-flag"` for the in-app paused `AnimatedFlag` preview. */
const STICKER_PREVIEW_MODE: "svg-asset" | "animated-flag" = "svg-asset"
const FLAG_STICKER_IMAGE_PATH = "/images/flag-sticker.svg" as const

const QUEER_RESOURCE_GUIDE_THUMB = {
  src: "/Queer-Resource-Guide.png",
  width: 922,
  height: 1275,
  label: "Queer Resource Guide cover, Atlanta edition",
} as const

const QUEER_FLAG_GUIDE_THUMB = {
  src: "/Queer-Flag-Guide.png",
  width: 1790,
  height: 2526,
  label: "LGBTQIA+ flags and their meanings — cover thumbnail",
} as const

/** Same fixed height for every print product thumbnail (covers + sticker). */
const PRINT_THUMB_FRAME =
  "flex h-56 min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-xl border border-foreground/10 bg-background/30 px-2 py-2 sm:h-60 sm:px-3 sm:py-3"

const PRINT_THUMB_IMAGE_SIZES = "(max-width: 768px) 92vw, (max-width: 1280px) 34vw, 400px" as const

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
    title: "Atlanta resource guide",
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

function PrintRasterThumbnail({
  src,
  width,
  height,
  label,
}: {
  src: string
  width: number
  height: number
  label: string
}) {
  return (
    <div className={PRINT_THUMB_FRAME}>
      <div
        className="flex min-h-0 flex-1 items-center justify-center"
        role="img"
        aria-label={label}
      >
        <Image
          src={src}
          alt=""
          width={width}
          height={height}
          sizes={PRINT_THUMB_IMAGE_SIZES}
          className="h-auto max-h-full w-auto max-w-full object-contain drop-shadow-[0_8px_28px_hsl(var(--foreground)/0.12)]"
        />
      </div>
    </div>
  )
}

/*
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
*/

export function PridePrintsPageClient() {
  const { cornerRadius, studioShellStyle } = useStudioShell()
  const { itemVariants } = useLearnPageIntroVariants()
  const stickerFlag = useMemo(() => stickerPreviewFlag(), [])

  return (
    <PrideLearnPageContent
      kicker="Print shop"
      title="Small-batch Prints"
      description="Small-batch print pieces and stickers from the project. Coming soon."
      // description="Small-batch print pieces and stickers from the project. Everything here is coming soon — leave your email per item if you want a ping when we open orders."
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
              <CardContent className="flex flex-1 flex-col gap-5 pt-6">
                <div className="flex flex-col gap-3">
                {product.id === "atlanta-resource-guide" ? (
                  <PrintRasterThumbnail
                    src={QUEER_RESOURCE_GUIDE_THUMB.src}
                    width={QUEER_RESOURCE_GUIDE_THUMB.width}
                    height={QUEER_RESOURCE_GUIDE_THUMB.height}
                    label={QUEER_RESOURCE_GUIDE_THUMB.label}
                  />
                ) : product.id === "queer-flag-guide" ? (
                  <PrintRasterThumbnail
                    src={QUEER_FLAG_GUIDE_THUMB.src}
                    width={QUEER_FLAG_GUIDE_THUMB.width}
                    height={QUEER_FLAG_GUIDE_THUMB.height}
                    label={QUEER_FLAG_GUIDE_THUMB.label}
                  />
                ) : product.id === "animated-flag-stickers" ? (
                  <div className={PRINT_THUMB_FRAME}>
                    <div
                      className="flex min-h-0 flex-1 flex-col items-center justify-center"
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
                          width={243}
                          height={188}
                          sizes={PRINT_THUMB_IMAGE_SIZES}
                          unoptimized
                          className="h-auto max-h-full w-auto max-w-full object-contain drop-shadow-[0_8px_28px_hsl(var(--foreground)/0.12)]"
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
                          className="w-auto! max-h-full max-w-full shrink-0 drop-shadow-[0_8px_28px_hsl(var(--foreground)/0.12)]!"
                        />
                      )}
                    </div>
                  </div>
                ) : null}
                <CardTitle className="flex items-start gap-2.5 font-display text-lg font-bold leading-tight tracking-tight sm:text-xl">
                  <product.Icon className="mt-0.5 size-6 shrink-0 opacity-80" aria-hidden />
                  <span>{product.title}</span>
                </CardTitle>
                <Badge variant="secondary" className="w-fit shrink-0 font-display text-[0.65rem] uppercase tracking-wider">
                  Coming soon
                </Badge>
                </div>
                <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
                  {product.description}
                </p>
                {/*
                <div className="mt-auto">
                  <ProductInterestForm productId={product.id} productTitle={product.title} />
                </div>
                */}
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </PrideLearnPageContent>
  )
}
