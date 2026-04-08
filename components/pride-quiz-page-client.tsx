"use client"

import { useCallback, useState } from "react"
import confetti from "canvas-confetti"
import { useReducedMotion } from "framer-motion"
import { Check, Trophy, X } from "lucide-react"
import { AnimatedFlag } from "@/components/animated-flag"
import { PrideLearnChrome } from "@/components/pride-learn-chrome"
import { useStudioShell } from "@/components/studio-shell-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { PRIDE_FLAGS } from "@/lib/flags"
import { QUIZ_QUESTIONS } from "@/lib/quiz-questions"
import { cn } from "@/lib/utils"

function QuizPageInner() {
  const { cornerRadius, studioShellStyle } = useStudioShell()
  const shouldReduceMotion = useReducedMotion()
  const [quizScore, setQuizScore] = useState(0)
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0)
  const [showQuizResult, setShowQuizResult] = useState(false)
  const [quizSelectedAnswer, setQuizSelectedAnswer] = useState<number | null>(null)
  const [quizAnswered, setQuizAnswered] = useState(false)

  const triggerCelebration = useCallback(() => {
    if (shouldReduceMotion) return

    const colors = ["#e40303", "#ff8c00", "#ffed00", "#008018", "#004cff", "#732982", "#ffffff"]
    const durationMs = 2200
    const endTime = Date.now() + durationMs

    const shoot = () => {
      confetti({
        particleCount: 6,
        startVelocity: 45,
        spread: 65,
        ticks: 320,
        gravity: 0.95,
        scalar: 1.1,
        colors,
        origin: { x: 0.5, y: 0.18 },
      })
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 70,
        startVelocity: 42,
        ticks: 320,
        gravity: 0.88,
        scalar: 0.9,
        colors,
        origin: { x: 0.08, y: 0.2 },
      })
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 70,
        startVelocity: 42,
        ticks: 320,
        gravity: 0.88,
        scalar: 0.9,
        colors,
        origin: { x: 0.92, y: 0.2 },
      })

      if (Date.now() < endTime) {
        window.requestAnimationFrame(shoot)
      }
    }

    shoot()
  }, [shouldReduceMotion])

  const handleAnswer = (answerIndex: number) => {
    if (quizAnswered) return

    setQuizSelectedAnswer(answerIndex)
    setQuizAnswered(true)

    if (answerIndex === QUIZ_QUESTIONS[currentQuizQuestion].correct) {
      setQuizScore((prev) => prev + 1)
    }

    window.setTimeout(() => {
      if (currentQuizQuestion < QUIZ_QUESTIONS.length - 1) {
        setCurrentQuizQuestion((prev) => prev + 1)
        setQuizSelectedAnswer(null)
        setQuizAnswered(false)
      } else {
        const finalScore =
          answerIndex === QUIZ_QUESTIONS[currentQuizQuestion].correct ? quizScore + 1 : quizScore
        if (finalScore === QUIZ_QUESTIONS.length) {
          triggerCelebration()
        }
        setShowQuizResult(true)
      }
    }, 1500)
  }

  const resetQuiz = () => {
    setCurrentQuizQuestion(0)
    setQuizScore(0)
    setQuizSelectedAnswer(null)
    setQuizAnswered(false)
    setShowQuizResult(false)
  }

  const retriggerCelebration = () => {
    triggerCelebration()
  }

  const cardShell = cn(cornerRadius <= 0 && "rounded-none")
  const softRadius = cornerRadius <= 0 && "rounded-none"

  const quizBody = (() => {
    if (showQuizResult) {
      return (
        <Card
          className={cn(
            "mx-auto w-full max-w-xl border-foreground/15 bg-background/40 text-center shadow-none lg:max-w-3xl",
            cardShell,
          )}
          style={studioShellStyle}
        >
          <CardHeader className="space-y-1">
            <CardTitle className="flex items-center justify-center gap-2 font-display text-2xl font-bold leading-tight tracking-tight sm:text-[1.75rem]">
              <Trophy className="size-6 shrink-0 text-yellow-500" aria-hidden />
              Quiz complete
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="font-display text-4xl font-black leading-none tabular-nums tracking-tight sm:text-5xl">
              {quizScore}/{QUIZ_QUESTIONS.length}
            </div>
            <p className="text-balance text-base leading-relaxed text-muted-foreground">
              {quizScore === QUIZ_QUESTIONS.length
                ? "Perfect! You're a flag expert! 🏳️‍🌈"
                : quizScore >= QUIZ_QUESTIONS.length * 0.8
                  ? "Excellent! You know your flags! 🌟"
                  : quizScore >= QUIZ_QUESTIONS.length * 0.6
                    ? "Great job! Keep learning! 💪"
                    : "Good start! Try exploring more flags! 📚"}
            </p>
            {quizScore === QUIZ_QUESTIONS.length && (
              <Button
                onClick={retriggerCelebration}
                variant="secondary"
                className={cn("w-full font-display font-bold uppercase tracking-wide", softRadius)}
                style={studioShellStyle}
              >
                Celebrate again
              </Button>
            )}
            <Button
              onClick={resetQuiz}
              className={cn("w-full font-display font-bold uppercase tracking-wide", softRadius)}
              style={studioShellStyle}
            >
              Take the quiz again
            </Button>
          </CardContent>
        </Card>
      )
    }

    const question = QUIZ_QUESTIONS[currentQuizQuestion]
    const relatedFlag = PRIDE_FLAGS.find((f) => f.id === question.flag)
    const quizProgressPercent = Math.round((currentQuizQuestion / QUIZ_QUESTIONS.length) * 100)

    return (
      <Card
        className={cn(
          "mx-auto w-full max-w-xl overflow-hidden border-foreground/15 bg-background/40 shadow-none lg:max-w-none lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-stretch lg:divide-x lg:divide-foreground/10",
          cardShell,
        )}
        style={studioShellStyle}
      >
        <CardHeader className="space-y-4 lg:pb-8 lg:pr-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Badge
              variant="outline"
              className={cn("font-display text-[0.65rem] font-bold uppercase tracking-[0.14em]", softRadius)}
            >
              Question {currentQuizQuestion + 1}/{QUIZ_QUESTIONS.length}
            </Badge>
            <div className="flex min-w-[8rem] flex-1 items-center justify-end gap-2 lg:min-w-0 lg:max-w-none">
              <Progress
                value={quizProgressPercent}
                className={cn(
                  "quiz-progress-track h-2 w-24 shrink sm:w-32 lg:min-w-0 lg:flex-1 lg:max-w-md",
                  softRadius,
                )}
              />
              <span className="text-sm font-medium tabular-nums text-muted-foreground">{quizProgressPercent}%</span>
            </div>
          </div>
          <CardTitle className="text-left font-display text-xl font-bold leading-snug tracking-tight sm:text-2xl sm:leading-snug lg:text-3xl lg:leading-snug">
            {question.question}
          </CardTitle>
          {relatedFlag ? (
            <AnimatedFlag
              backgroundColors={relatedFlag.display.stripes || []}
              svgForeground={relatedFlag.display.svgForeground}
              className={cn("mt-3 w-full max-w-lg self-start lg:mt-5 lg:max-w-xl", softRadius)}
              style={studioShellStyle}
            />
          ) : null}
        </CardHeader>
        <CardContent className="p-4 lg:flex lg:flex-col lg:justify-center">
          <div className="space-y-2.5 lg:h-full lg:grid lg:grid-cols-2 lg:grid-rows-2 lg:gap-3 lg:space-y-0">
            {question.options.map((option, index) => {
              const isCorrect = quizAnswered && index === question.correct
              const isWrongSelection = quizAnswered && quizSelectedAnswer === index && index !== question.correct
              const isDimmed = quizAnswered && !isCorrect && !isWrongSelection

              const statusSuffix = quizAnswered
                ? isCorrect
                  ? ", correct answer"
                  : isWrongSelection
                    ? ", your answer — incorrect"
                    : ", other option"
                : ""

              return (
                <div key={option} className={quizAnswered && quizSelectedAnswer === index ? "quiz-answer-selected-pop" : ""}>
                  <Button
                    variant="outline"
                    size="lg"
                    className={cn(
                      "quiz-answer-btn h-auto min-h-12 w-full max-md:justify-start px-4 py-3.5 font-display text-base font-semibold leading-snug whitespace-normal text-pretty lg:h-full",
                      softRadius,
                      !quizAnswered && "quiz-answer-btn--interactive",
                      isCorrect && "quiz-answer-btn--correct",
                      isWrongSelection && "quiz-answer-btn--incorrect",
                      isDimmed && "quiz-answer-btn--dimmed",
                      quizAnswered && "pointer-events-none shadow-none",
                    )}
                    style={studioShellStyle}
                    onClick={() => handleAnswer(index)}
                    aria-label={`${option}${statusSuffix}`}
                    aria-disabled={quizAnswered}
                    tabIndex={quizAnswered ? -1 : 0}
                  >
                    <span
                      className={cn(
                        "flex w-full min-w-0 gap-3 items-center justify-between lg:h-full lg:flex-col lg:justify-center lg:text-center",
                      )}
                    >
                      <span className="relative max-md:w-full flex max-md:text-left items-center justify-between">
                        {option}
                        {isCorrect ? (
                          <Check className="size-5 shrink-0 text-primary lg:absolute lg:-top-6 lg:left-1/2 lg:-translate-x-1/2" strokeWidth={2.75} aria-hidden />
                        ) : null}
                        {isWrongSelection ? (
                          <X className="size-5 shrink-0 text-destructive lg:absolute lg:-top-6 lg:left-1/2 lg:-translate-x-1/2" strokeWidth={2.75} aria-hidden />
                        ) : null}
                      </span>
                    </span>
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  })()

  return quizBody
}

export function PrideQuizPageClient() {
  return (
    <PrideLearnChrome
      kicker="Prism · quiz"
      title="Flag knowledge quiz"
      description="Test what you know about LGBTQIA+ flags—ten questions, no pressure."
      wideLayout
    >
      <QuizPageInner />
    </PrideLearnChrome>
  )
}
