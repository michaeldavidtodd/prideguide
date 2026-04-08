"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Heart } from "lucide-react"
import { PrideLearnChrome } from "@/components/pride-learn-chrome"
import { useStudioShell } from "@/components/studio-shell-context"
import { Card } from "@/components/ui/card"
import { ALLY_TIPS } from "@/lib/ally-tips"
import { PRIDE_FLAGS } from "@/lib/flags"
import { cn } from "@/lib/utils"

function allyAccentStripe(index: number): string {
  const first = PRIDE_FLAGS[index % PRIDE_FLAGS.length]?.display.stripes?.[0]
  if (typeof first === "string" && first.startsWith("#")) return first
  return "hsl(var(--primary))"
}

function AllyPageInner() {
  const shouldReduceMotion = useReducedMotion()
  const { cornerRadius, studioShellStyle } = useStudioShell()

  return (
    <div className="grid gap-6 sm:grid-cols-2 sm:gap-7 lg:gap-8">
      {ALLY_TIPS.map((tip, index) => {
        const accent = allyAccentStripe(index)
        return (
          <motion.article
            key={tip.title}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 * index, ease: [0.22, 1, 0.36, 1] }}
            className="h-full"
          >
            <Card
              className={cn(
                "group relative flex h-full flex-col overflow-hidden border border-foreground/12 bg-background/60 p-0 shadow-none",
                "transition-[border-color,box-shadow,background-color] duration-200 ease-out",
                "hover:border-foreground/25 hover:bg-background/80 hover:shadow-md",
                cornerRadius <= 0 && "rounded-none",
              )}
              style={{
                ...studioShellStyle,
                borderLeftWidth: 4,
                borderLeftStyle: "solid",
                borderLeftColor: accent,
              }}
            >
              <div className="flex flex-1 flex-col px-5 py-6 sm:px-6 sm:py-8">
                <div className="mb-4 flex items-center justify-between gap-3 border-b border-foreground/10 pb-3">
                  <span className="font-mono text-[0.7rem] font-bold tabular-nums tracking-[0.2em] text-muted-foreground sm:text-xs">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <Heart
                    className="size-[1.125rem] shrink-0 stroke-[2.25] text-primary opacity-90 transition-transform duration-200 ease-out group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    aria-hidden
                  />
                </div>

                <h2 className="text-balance font-display text-[1.375rem] font-extrabold leading-[1.08] tracking-tight text-foreground sm:text-[1.625rem] sm:leading-[1.06]">
                  {tip.title}
                </h2>

                <p className="mt-4 max-w-[54ch] text-base font-normal leading-[1.65] text-muted-foreground sm:mt-5 sm:text-[1.0625rem] sm:leading-[1.7]">
                  {tip.content}
                </p>
              </div>
            </Card>
          </motion.article>
        )
      })}
    </div>
  )
}

export function PrideAllyPageClient() {
  return (
    <PrideLearnChrome
      kicker="Prism · allyship"
      title="Ally guide"
      description="Practical ways to show up—without centering yourself or treating people as a lesson plan."
    >
      <AllyPageInner />
    </PrideLearnChrome>
  )
}
