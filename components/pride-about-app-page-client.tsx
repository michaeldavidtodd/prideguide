"use client"

import Link from "next/link"
import { BookOpen } from "lucide-react"
import { PrideLearnChrome } from "@/components/pride-learn-chrome"
import { PrismMarkLogo } from "@/components/prism-mark-logo"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PRIDE_CLASSIC_PATH, PRIDE_EXPLORE_PATH } from "@/lib/pride-routes"
import { PRIDE_FLAGS } from "@/lib/flags"
import { QUIZ_QUESTIONS } from "@/lib/quiz-questions"

export function PrideAboutAppPageClient() {
  return (
    <PrideLearnChrome
      kicker="Prism · about"
      title="About Pride Guide"
      description="Education and celebration through accurate colors, history, and the stories flags carry."
    >
      <div className="space-y-8">
        <Card className="rounded-none border-foreground/15 bg-background/40 shadow-none">
          <CardHeader className="space-y-0 pb-2">
            <CardTitle className="flex items-center gap-2.5 font-display text-xl font-bold leading-tight tracking-tight sm:text-2xl">
              <BookOpen className="size-5 shrink-0 opacity-80" aria-hidden />
              What you get
            </CardTitle>
          </CardHeader>
          <CardContent className="max-w-prose space-y-6">
            <p className="text-balance text-base leading-relaxed text-muted-foreground">
              Pride Guide is an educational app celebrating the diversity and beauty of the LGBTQIA+ community through
              its flags and symbols.
            </p>
            <div className="space-y-3">
              <h4 className="font-display text-[0.7rem] font-bold uppercase leading-none tracking-[0.2em] text-foreground">
                Features
              </h4>
              <ul className="list-disc space-y-2.5 pl-5 text-base leading-relaxed text-muted-foreground marker:text-foreground/35">
                <li>Immersive flag explorer with {PRIDE_FLAGS.length} flags</li>
                <li>Interactive quiz with {QUIZ_QUESTIONS.length} questions</li>
                <li>Ally guidance and tips</li>
                <li>Historical context and meanings per flag</li>
              </ul>
            </div>
            <div className="border-t border-foreground/10 pt-5">
              <p className="text-center text-sm leading-relaxed text-muted-foreground">Made with 🏳️‍🌈 for education and celebration</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-none border-foreground/15 bg-background/40 shadow-none lg:flex lg:flex-row lg:justify-center lg:gap-8">
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
        </Card>

        <p className="text-center text-base leading-normal text-muted-foreground">
          <Link
            href={PRIDE_EXPLORE_PATH}
            className="font-display text-sm font-bold uppercase tracking-[0.14em] underline underline-offset-4 hover:text-foreground"
          >
            Explore flags
          </Link>
          <span className="mx-2.5 tabular-nums opacity-40" aria-hidden>
            ·
          </span>
          <Link
            href={PRIDE_CLASSIC_PATH}
            className="text-sm underline decoration-foreground/30 underline-offset-4 hover:text-foreground"
          >
            Classic layout
          </Link>
        </p>
      </div>
    </PrideLearnChrome>
  )
}
