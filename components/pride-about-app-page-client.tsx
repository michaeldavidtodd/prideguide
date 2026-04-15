"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { BookOpen } from "lucide-react"
import { PrideLearnPageContent, useLearnPageIntroVariants } from "@/components/pride-learn-chrome"
import { useStudioShell } from "@/components/studio-shell-context"
import { PrismMarkLogo } from "@/components/prism-mark-logo"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PRIDE_EXPLORE_PATH } from "@/lib/pride-routes"
import { PRIDE_FLAGS } from "@/lib/flags"
import { QUIZ_QUESTIONS } from "@/lib/quiz-questions"
import { cn } from "@/lib/utils"

export function PrideAboutAppPageClient() {
  const { cornerRadius, studioShellStyle } = useStudioShell()
  const { itemVariants } = useLearnPageIntroVariants()

  return (
    <PrideLearnPageContent
      kicker="About"
      title="About the guide"
      description="Education and celebration through accurate colors, history, and the stories flags carry."
      introAnimation
      introBodyStagger
    >
      {[
        <motion.div key="about-features" variants={itemVariants}>
        <Card
          className={cn("border-foreground/15 bg-background/40 xl:p-12 shadow-none", cornerRadius <= 0 && "rounded-none")}
          style={studioShellStyle}
        >
          <CardHeader className="max-w-prose mx-auto space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2.5 font-display text-xl font-bold leading-tight tracking-tight sm:text-4xl">
              <BookOpen className="size-8 sm:mt-1.5 shrink-0 opacity-80" aria-hidden />
              Queer Education
            </CardTitle>
          </CardHeader>
          <CardContent className="max-w-prose mx-auto space-y-6">
            <p className="text-balance text-lg leading-relaxed text-muted-foreground">
              Pride Guide is an educational app celebrating the diversity and beauty of the LGBTQIA+ community through
              its flags. More flags will be added over time. And we plan to support contributions from the community.
            </p>
            <div className="space-y-3">
              <h4 className="font-display text-xs font-bold uppercase leading-tight tracking-[0.18em] text-primary sm:text-sm">
                Features
              </h4>
              <ul className="list-disc space-y-2.5 pl-5 text-base leading-relaxed text-muted-foreground marker:text-foreground/35">
                <li>Immersive flag explorer with {PRIDE_FLAGS.length} flags (more to come)</li>
                <li>Interactive quiz with {QUIZ_QUESTIONS.length} questions</li>
                <li>Ally guidance and tips</li>
                <li>Historical context and meanings per flag</li>
              </ul>
            </div>
          </CardContent>
        </Card>
        </motion.div>,

        <motion.div key="about-prism" variants={itemVariants}>
        {/* <Card
          className={cn(
            "border-foreground/15 bg-background/40 shadow-none lg:flex lg:flex-row lg:justify-center lg:gap-8",
            cornerRadius <= 0 && "rounded-none",
          )}
          style={studioShellStyle}
        >
          <CardHeader>
            <CardTitle className="flex flex-col items-center gap-3 font-display text-xl sm:flex-row sm:justify-center">
              <span className="sr-only">PRISM</span>
              <PrismMarkLogo className="h-24 w-auto text-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent className="mx-auto max-w-prose space-y-4 text-center lg:mx-0 lg:my-auto lg:p-0 lg:text-left">
            <p className="text-balance text-base leading-relaxed text-muted-foreground">
              Promoting Representation, Inclusivity, and Social justice through Multimedia. PRISM is a grassroots group
              of queer and ally individuals looking to use our voices, experiences, skills, and talents to help make the
              world a brighter place for all.
            </p>
          </CardContent>
        </Card> */}
        </motion.div>,

        <div key="about-footer">
          <p className="text-center text-sm leading-relaxed text-muted-foreground">Made with 🏳️‍🌈 pride for education and celebration by <Link href="https://pixeluiz.com" target="_blank" className="underline">Pixel Uiz</Link></p>
        </div>
      ]}
    </PrideLearnPageContent>
  )
}
