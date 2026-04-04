"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import confetti from "canvas-confetti"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Heart, Search, BookOpen, Trophy, Flag, Info, ChevronDown, SlidersHorizontal } from "lucide-react"
import HeroSection from "@/components/hero-section"
import { ThemeToggle } from "@/components/theme-toggle"
import { FlagCardTransition } from "@/components/flag-card-transition"
import { AnimatedFlag } from "@/components/animated-flag"
import { FlagRingCarousel } from "@/components/flag-ring-carousel"
import { PRIDE_FLAGS as flags, type FlagDefinition } from "@/lib/flags"

const allyTips = [
  {
    title: "Listen and Learn",
    content: "Approach conversations with genuine curiosity and respect. Listen more than you speak.",
  },
  {
    title: "Use Correct Pronouns",
    content: "Always use the pronouns someone tells you they use. If unsure, ask politely or use they/them.",
  },
  {
    title: "Educate Yourself",
    content: "Don't expect LGBTQIA+ people to educate you. Use resources like this app to learn independently.",
  },
  {
    title: "Speak Up",
    content: "Use your privilege to advocate for LGBTQIA+ rights and call out discrimination when you see it.",
  },
  {
    title: "Respect Privacy",
    content: "Never out someone or share their personal information without permission.",
  },
  {
    title: "Support LGBTQIA+ Businesses",
    content: "Show support through your actions and spending choices.",
  },
]

export default function LGBTQIAFlagGuide() {
  const [activeTab, setActiveTab] = useState("flags")
  const [selectedFlag, setSelectedFlag] = useState<FlagDefinition | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [quizScore, setQuizScore] = useState(0)
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0)
  const [showQuizResult, setShowQuizResult] = useState(false)
  const [quizSelectedAnswer, setQuizSelectedAnswer] = useState<number | null>(null)
  const [quizAnswered, setQuizAnswered] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [isMobileFiltersExpanded, setIsMobileFiltersExpanded] = useState(false)
  const [isMainContentInView, setIsMainContentInView] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  const categories = ["All", "General", "Sexual Orientation", "Gender Identity"]

  const matchesFilter = useCallback(
    (flag: FlagDefinition) => {
      const q = searchTerm.toLowerCase()
      const matchesSearch =
        flag.name.toLowerCase().includes(q) || flag.description.toLowerCase().includes(q)
      const matchesCategory = selectedCategory === "All" || flag.category === selectedCategory
      return matchesSearch && matchesCategory
    },
    [searchTerm, selectedCategory]
  )

  const filteredFlags = useMemo(() => flags.filter(matchesFilter), [matchesFilter])
  const categoryCounts = useMemo(() => {
    const q = searchTerm.toLowerCase()
    const matchesSearch = (flag: FlagDefinition) =>
      flag.name.toLowerCase().includes(q) || flag.description.toLowerCase().includes(q)

    return {
      All: flags.filter(matchesSearch).length,
      General: flags.filter((flag) => flag.category === "General" && matchesSearch(flag)).length,
      "Sexual Orientation": flags.filter((flag) => flag.category === "Sexual Orientation" && matchesSearch(flag)).length,
      "Gender Identity": flags.filter((flag) => flag.category === "Gender Identity" && matchesSearch(flag)).length,
    }
  }, [searchTerm])
  const getCategoryCount = (category: string) => categoryCounts[category as keyof typeof categoryCounts] ?? 0
  const tabOrder = ["flags", "quiz", "ally", "about"] as const
  const tabItems: { value: (typeof tabOrder)[number]; label: string; Icon: typeof Flag }[] = [
    { value: "flags", label: "Flags", Icon: Flag },
    { value: "quiz", label: "Quiz", Icon: Trophy },
    { value: "ally", label: "Ally", Icon: Heart },
    { value: "about", label: "About", Icon: Info },
  ]
  const tabsTriggerClassName =
    "min-h-11 rounded-lg border border-transparent px-1.5 py-2.5 flex items-center gap-2 text-xs font-semibold tracking-wide text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-background/60 hover:text-foreground data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:px-3 sm:py-3 sm:text-sm"
  const activeTabIndex = Math.max(0, tabOrder.indexOf(activeTab as (typeof tabOrder)[number]))

  useEffect(() => {
    const updateMainContentVisibility = () => {
      setIsMainContentInView(window.scrollY >= window.innerHeight - 500)
    }

    updateMainContentVisibility()
    window.addEventListener("scroll", updateMainContentVisibility, { passive: true })
    window.addEventListener("resize", updateMainContentVisibility)
    return () => {
      window.removeEventListener("scroll", updateMainContentVisibility)
      window.removeEventListener("resize", updateMainContentVisibility)
    }
  }, [])

  useEffect(() => {
    if (activeTab !== "flags") {
      setIsMobileFiltersExpanded(false)
    }
  }, [activeTab])

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

  // Expanded quiz questions
  const quizQuestions = [
    {
      question: "Which flag was created by Gilbert Baker in 1978 with 8 original colors?",
      options: ["Original Pride Flag", "Transgender Flag", "Bisexual Flag", "Lesbian Flag"],
      correct: 0,
      flag: "original-pride",
    },
    {
      question: "What do the colors pink, yellow, and blue represent on the Pansexual flag?",
      options: ["Love, Joy, Peace", "Women, Non-binary, Men", "Past, Present, Future", "Earth, Sun, Sky"],
      correct: 1,
      flag: "pansexual",
    },
    {
      question: "Who created the Transgender Pride Flag?",
      options: ["Daniel Quasar", "Monica Helms", "Michael Page", "Kye Rowan"],
      correct: 1,
      flag: "transgender",
    },
    {
      question: "What does the white stripe represent on the Transgender Pride Flag?",
      options: ["Peace", "Those transitioning or non-binary", "Unity", "Purity"],
      correct: 1,
      flag: "transgender",
    },
    {
      question: "Which flag features only yellow and purple colors?",
      options: ["Non-Binary Flag", "Intersex Flag", "Agender Flag", "Genderfluid Flag"],
      correct: 1,
      flag: "intersex",
    },
    {
      question: "What year was the Progress Pride Flag created?",
      options: ["2015", "2017", "2018", "2020"],
      correct: 2,
      flag: "progress",
    },
    {
      question: "Which flag represents attraction to multiple, but not all, genders?",
      options: ["Pansexual", "Bisexual", "Polysexual", "Omnisexual"],
      correct: 2,
      flag: "polysexual",
    },
    {
      question: "What does the black stripe represent on the Asexual Pride Flag?",
      options: ["Darkness", "Asexuality", "Mystery", "Strength"],
      correct: 1,
      flag: "asexual",
    },
    {
      question: "Which flag was created by Kye Rowan in 2014?",
      options: ["Genderfluid Flag", "Non-Binary Flag", "Agender Flag", "Aromantic Flag"],
      correct: 1,
      flag: "nonbinary",
    },
    {
      question: "What distinguishes the Original Pride Flag from the standard 6-color Pride Flag?",
      options: [
        "Different creator",
        "Has 8 colors including hot pink and turquoise",
        "Different year created",
        "Different meaning",
      ],
      correct: 1,
      flag: "original-pride",
    },
  ]

  const handleCardClick = (flag: FlagDefinition) => {
    setSelectedFlag(flag)
  }

  const QuizComponent = () => {
    const handleAnswer = (answerIndex: number) => {
      if (quizAnswered) return

      setQuizSelectedAnswer(answerIndex)
      setQuizAnswered(true)

      if (answerIndex === quizQuestions[currentQuizQuestion].correct) {
        setQuizScore((prev) => prev + 1)
      }

      setTimeout(() => {
        if (currentQuizQuestion < quizQuestions.length - 1) {
          setCurrentQuizQuestion((prev) => prev + 1)
          setQuizSelectedAnswer(null)
          setQuizAnswered(false)
        } else {
          const finalScore =
            answerIndex === quizQuestions[currentQuizQuestion].correct ? quizScore + 1 : quizScore
          if (finalScore === quizQuestions.length) {
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

    if (showQuizResult) {
      return (
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Quiz Complete!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">
              {quizScore}/{quizQuestions.length}
            </div>
            <p className="text-muted-foreground mb-4">
              {quizScore === quizQuestions.length
                ? "Perfect! You're a flag expert! 🏳️‍🌈"
                : quizScore >= quizQuestions.length * 0.8
                  ? "Excellent! You know your flags! 🌟"
                  : quizScore >= quizQuestions.length * 0.6
                    ? "Great job! Keep learning! 💪"
                    : "Good start! Try exploring more flags! 📚"}
            </p>
            {quizScore === quizQuestions.length && (
              <Button onClick={retriggerCelebration} variant="secondary" className="mb-3 w-full">
                Celebrate Again
              </Button>
            )}
            <Button onClick={resetQuiz} className="w-full">
              Take the quick again
            </Button>
          </CardContent>
        </Card>
      )
    }

    const question = quizQuestions[currentQuizQuestion]
    const relatedFlag = flags.find((f) => f.id === question.flag)
    const quizProgressPercent = Math.round((currentQuizQuestion / quizQuestions.length) * 100)

    return (
      <Card className="overflow-hidden">
        <div>
          <CardHeader>
            <div className="mb-2 flex items-center justify-between">
              <Badge variant="outline">
                Question {currentQuizQuestion + 1}/{quizQuestions.length}
              </Badge>
              <div className="flex items-center gap-2">
                <Progress value={quizProgressPercent} className="quiz-progress-track w-24" />
                <span className="text-xs font-medium text-muted-foreground">{quizProgressPercent}%</span>
              </div>
            </div>
            <CardTitle className="text-lg">{question.question}</CardTitle>
            {relatedFlag && (
              <AnimatedFlag
                backgroundColors={relatedFlag.display.stripes || []}
                svgForeground={relatedFlag.display.svgForeground}
                className="mt-2 h-16 rounded-lg"
              />
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className={quizAnswered && quizSelectedAnswer === index ? "quiz-answer-selected-pop" : ""}
                >
                  {(() => {
                    const isCorrect = quizAnswered && index === question.correct
                    const isWrongSelection = quizAnswered && quizSelectedAnswer === index && index !== question.correct
                    const isDimmed = quizAnswered && !isCorrect && !isWrongSelection

                    const answerStyle: React.CSSProperties = {
                      transition:
                        "background-color 420ms cubic-bezier(0.22, 1, 0.36, 1), color 420ms cubic-bezier(0.22, 1, 0.36, 1), border-color 420ms cubic-bezier(0.22, 1, 0.36, 1), transform 420ms cubic-bezier(0.22, 1, 0.36, 1), opacity 420ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 420ms cubic-bezier(0.22, 1, 0.36, 1)",
                      transform: "none",
                      opacity: isDimmed ? 0.55 : 1,
                      backgroundColor: isCorrect
                        ? "hsl(var(--primary))"
                        : isWrongSelection
                          ? "hsl(var(--destructive))"
                          : "hsl(var(--background))",
                      borderColor: isCorrect
                        ? "hsl(var(--primary))"
                        : isWrongSelection
                          ? "hsl(var(--destructive))"
                          : "hsl(var(--input))",
                      color: isCorrect || isWrongSelection ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))",
                      boxShadow: isCorrect
                        ? "0 0 0 3px hsl(var(--primary) / 0.45)"
                        : isWrongSelection
                          ? "0 0 0 3px hsl(var(--destructive) / 0.45)"
                          : "0 0 0 0 hsl(var(--primary) / 0)",
                    }

                    return (
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    style={answerStyle}
                    onClick={() => handleAnswer(index)}
                    aria-disabled={quizAnswered}
                    tabIndex={quizAnswered ? -1 : 0}
                  >
                    {option}
                    {quizAnswered && index === question.correct && " ✓"}
                    {quizAnswered && quizSelectedAnswer === index && index !== question.correct && " ✗"}
                  </Button>
                    )
                  })()}
                </div>
              ))}
            </div>
          </CardContent>
        </div>
      </Card>
    )
  }

  return (
    <div className="page-container">
      {/* Fixed Hero Section */}
      <div className="hero-fixed">
        <HeroSection />
      </div>

      {/* Scrolling Content */}
      <div className="content-overlay pointer-events-none">
        {/* Spacer to push content down initially */}
        <div className="content-spacer" />

        {/* Main Content */}
        <div className="main-content pointer-events-auto">
          <div className="container mx-auto px-4 py-12 sm:px-6">
            {/* Header — editorial, left-weighted; no gradient-text / sparkle trope */}
            <header className="relative mb-8 flex flex-col gap-4 sm:mb-14 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
              <div className="max-w-2xl pr-14 text-left sm:pr-0">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  Prism · queer flag wiki
                </p>
                <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                  Pride Guide
                </h2>
                <span
                  className="mt-3 block h-2 w-36 max-w-full sm:mt-4 sm:w-56"
                  style={{
                    background:
                      "linear-gradient(90deg, #e40303 0%, #ff8c00 16.6%, #ffed00 33.3%, #008018 50%, #004cff 66.6%, #732982 83.3%, #e40303 100%)",
                  }}
                  aria-hidden
                />
                <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground text-balance sm:mt-5 sm:text-lg">
                  Learn the symbols for real. History and meaning—loud, clear, and unapologetic.
                </p>
              </div>
              <div className="absolute right-0 top-0 flex shrink-0 justify-end sm:static sm:justify-end sm:pb-1">
                <ThemeToggle />
              </div>
            </header>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="relative mb-6 grid h-auto w-full max-w-none grid-cols-4 gap-1 rounded-xl border border-border/70 bg-muted/40 p-1 sm:mb-8">
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute bottom-0 left-0 w-1/4"
                  animate={shouldReduceMotion ? undefined : { x: `${activeTabIndex * 100}%` }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="mx-auto h-0.5 w-1/2 bg-gradient-to-r from-[#e40303] via-[#ffed00] to-[#004cff] [mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent)]" />
                </motion.div>
                {tabItems.map(({ value, label, Icon }) => (
                  <TabsTrigger key={value} value={value} className={tabsTriggerClassName}>
                    <Icon className="size-4" />
                    <span className="hidden min-[390px]:inline">{label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="flags" className="hidden" />

              <TabsContent value="quiz" className="space-y-6">
                <motion.div
                  className="mb-6 max-w-md mx-auto text-center"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl mb-2">Flag Knowledge Quiz</h2>
                  <p className="text-muted-foreground">Test your knowledge about LGBTQIA+ flags!</p>
                </motion.div>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={showQuizResult ? "quiz-result" : `quiz-step-${currentQuizQuestion}`}
                    className="max-w-md mx-auto"
                    initial={shouldReduceMotion ? false : { opacity: 0, x: 40 }}
                    animate={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
                    exit={shouldReduceMotion ? {} : { opacity: 0, x: -40 }}
                    transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <QuizComponent />
                  </motion.div>
                </AnimatePresence>
              </TabsContent>

              <TabsContent value="ally" className="space-y-6">
                <motion.div
                  className="mb-6 max-w-md mx-auto text-center"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl mb-2">Ally Guide</h2>
                  <p className="text-muted-foreground">How to be a supportive ally</p>
                </motion.div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {allyTips.map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
                      animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.03 * index, ease: [0.22, 1, 0.36, 1] }}
                      whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.01 }}
                    >
                    <Card>
                      <CardHeader>
                        <CardTitle className="font-display flex items-center gap-2 text-lg font-semibold">
                          <Heart className="h-5 w-5 text-foreground/70" aria-hidden />
                          {tip.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{tip.content}</p>
                      </CardContent>
                    </Card>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="about" className="space-y-6">
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                <Card className="max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      About Pride Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Pride Guide is an educational app celebrating the diversity and beauty of the LGBTQIA+ community
                      through its flags and symbols.
                    </p>
                    <div className="space-y-2">
                      <h4 className="font-semibold">Features:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Comprehensive flag directory with {flags.length} flags</li>
                        <li>• Interactive learning quiz with {quizQuestions.length} questions</li>
                        <li>• Ally guidance and tips</li>
                        <li>• Historical context and meanings</li>
                      </ul>
                    </div>
                    <div className="pt-4 border-t">
                      <p className="text-xs text-muted-foreground text-center">
                        Made with 🏳️‍🌈 for education and celebration
                      </p>
                    </div>
                  </CardContent>
                </Card>
                </motion.div>
                <motion.div
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                  animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                <Card className="max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-center gap-2">
                      {/* Inlined Prism Logo SVG */}
                      <svg
                        width="251"
                        height="349"
                        viewBox="0 0 251 349"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-12 w-auto"
                      >
                        <path
                          d="M112.567 13.3076C118.529 2.95288 133.471 2.95288 139.433 13.3076L238.757 185.817C243.598 194.226 239.611 204.965 230.456 208.178L134.442 241.866C128.977 243.784 123.023 243.784 117.558 241.866L21.5439 208.178C12.3886 204.965 8.40192 194.226 13.2432 185.817L112.567 13.3076Z"
                          fill="#D9D9D9"
                          stroke="currentColor"
                          strokeWidth="11"
                        />
                        <mask
                          id="mask0_14_190"
                          style={{ maskType: "alpha" }}
                          maskUnits="userSpaceOnUse"
                          x="16"
                          y="11"
                          width="220"
                          height="227"
                        >
                          <path
                            d="M117.334 16.0519C121.18 9.37139 130.82 9.37139 134.666 16.0519L233.99 188.562C237.114 193.987 234.542 200.915 228.635 202.988L132.622 236.677C128.335 238.181 123.665 238.181 119.378 236.677L23.365 202.988C17.4583 200.915 14.8863 193.987 18.0097 188.562L117.334 16.0519Z"
                            fill="#D9D9D9"
                          />
                        </mask>
                        <g mask="url(#mask0_14_190)">
                          <path d="M240.117 -191L-0.883052 208L240.117 -60.3363V-191Z" fill="#FF4382" />
                          <path d="M240.117 -60L-0.883052 208L240.117 7V-60Z" fill="#FF9D49" />
                          <path d="M240.117 7L-0.883052 208L240.117 78V7Z" fill="#EDEB5A" />
                          <path d="M240.117 78L-0.883052 208L240.117 145V78Z" fill="#4DD7BC" />
                          <path d="M240.117 145L-0.883052 208H240.117V145Z" fill="#00ACCB" />
                          <path d="M291.117 188L-0.883062 208L240.365 278L291.117 188Z" fill="#6500B2" />
                          <path d="M275.117 239.5L-0.883053 208L240.465 278L275.117 239.5Z" fill="#0C0C0C" />
                        </g>
                        <path
                          d="M3.65625 330V273.273H28.142C32.3523 273.273 36.0362 274.104 39.1939 275.766C42.3516 277.428 44.8075 279.763 46.5618 282.773C48.3161 285.783 49.1932 289.301 49.1932 293.327C49.1932 297.389 48.2884 300.907 46.4787 303.88C44.6875 306.853 42.1669 309.143 38.9169 310.749C35.6854 312.356 31.9091 313.159 27.5881 313.159H12.9631V301.193H24.4858C26.2955 301.193 27.8374 300.879 29.1115 300.251C30.4041 299.605 31.392 298.691 32.0753 297.509C32.777 296.327 33.1278 294.933 33.1278 293.327C33.1278 291.702 32.777 290.317 32.0753 289.172C31.392 288.009 30.4041 287.122 29.1115 286.513C27.8374 285.885 26.2955 285.571 24.4858 285.571H19.0568V330H3.65625ZM54.8438 330V273.273H79.3295C83.5398 273.273 87.2237 274.039 90.3814 275.572C93.5391 277.104 95.995 279.311 97.7493 282.192C99.5036 285.072 100.381 288.526 100.381 292.551C100.381 296.614 99.4759 300.039 97.6662 302.827C95.875 305.616 93.3544 307.721 90.1044 309.143C86.8729 310.565 83.0966 311.276 78.7756 311.276H64.1506V299.31H75.6733C77.483 299.31 79.0249 299.088 80.299 298.645C81.5916 298.183 82.5795 297.454 83.2628 296.457C83.9645 295.46 84.3153 294.158 84.3153 292.551C84.3153 290.926 83.9645 289.606 83.2628 288.59C82.5795 287.556 81.5916 286.799 80.299 286.319C79.0249 285.82 77.483 285.571 75.6733 285.571H70.2443V330H54.8438ZM88.0824 303.963L102.264 330H85.5341L71.6847 303.963H88.0824ZM122.346 273.273V330H106.945V273.273H122.346ZM160.224 291C160.076 289.153 159.384 287.713 158.147 286.679C156.928 285.645 155.072 285.128 152.579 285.128C150.991 285.128 149.689 285.322 148.674 285.71C147.676 286.079 146.938 286.587 146.458 287.233C145.978 287.879 145.728 288.618 145.71 289.449C145.673 290.132 145.793 290.751 146.07 291.305C146.365 291.84 146.827 292.33 147.455 292.773C148.083 293.197 148.886 293.585 149.865 293.936C150.843 294.287 152.007 294.601 153.355 294.878L158.008 295.875C161.147 296.54 163.834 297.417 166.069 298.506C168.303 299.596 170.131 300.879 171.553 302.357C172.975 303.815 174.018 305.459 174.683 307.287C175.366 309.115 175.717 311.109 175.735 313.27C175.717 317 174.784 320.158 172.938 322.743C171.091 325.328 168.451 327.295 165.016 328.643C161.6 329.991 157.491 330.665 152.69 330.665C147.76 330.665 143.457 329.935 139.782 328.477C136.126 327.018 133.282 324.774 131.251 321.746C129.238 318.699 128.223 314.803 128.204 310.057H142.829C142.922 311.793 143.355 313.251 144.131 314.433C144.907 315.615 145.996 316.511 147.4 317.12C148.821 317.729 150.511 318.034 152.468 318.034C154.112 318.034 155.488 317.831 156.596 317.425C157.703 317.018 158.544 316.455 159.116 315.735C159.689 315.015 159.984 314.193 160.002 313.27C159.984 312.402 159.698 311.645 159.144 310.999C158.608 310.334 157.722 309.743 156.485 309.226C155.248 308.69 153.576 308.192 151.471 307.73L145.821 306.511C140.798 305.422 136.837 303.603 133.938 301.055C131.057 298.488 129.626 294.989 129.645 290.557C129.626 286.956 130.586 283.808 132.525 281.112C134.483 278.397 137.188 276.283 140.641 274.768C144.113 273.254 148.092 272.497 152.579 272.497C157.159 272.497 161.12 273.263 164.462 274.796C167.804 276.329 170.38 278.489 172.19 281.278C174.018 284.048 174.941 287.288 174.96 291H160.224ZM181.594 273.273H200.761L213.946 305.403H214.611L227.795 273.273H246.963V330H231.895V297.205H231.452L218.821 329.557H209.736L197.105 296.983H196.662V330H181.594V273.273Z"
                          fill="currentColor"
                        />
                      </svg>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-center">
                    <p className="text-muted-foreground">
                      Promoting Representation, Inclusivity, and Social justice through Multimedia. PRISM is a
                      grassroots group of queer and ally individuals looking to use our voices, experiences, skills, and
                      talents to help make the world a brighter place for all.
                    </p>
                    <p className="text-sm font-semibold">Current project: queer flag wiki.</p>
                  </CardContent>
                </Card>
                </motion.div>
              </TabsContent>
            </Tabs>

            {/* Flag Card Transition */}
            <FlagCardTransition
              flag={selectedFlag}
              isOpen={!!selectedFlag}
              onClose={() => {
                setSelectedFlag(null)
              }}
            />
          </div>

          {activeTab === "flags" && (
            <div className="relative left-1/2 right-1/2 w-screen -ml-[50vw] -mr-[50vw] overflow-visible">
              {filteredFlags.length === 0 ? (
                <Card className="mx-auto my-6 max-w-md py-12 text-center">
                  <CardContent>
                    <p className="text-muted-foreground">No flags found matching your search.</p>
                  </CardContent>
                </Card>
              ) : (
                <FlagRingCarousel flags={filteredFlags} onSelect={handleCardClick} />
              )}
            </div>
          )}

        </div>
      </div>
      {activeTab === "flags" && (
        <div
          className={`fixed inset-x-0 z-50 px-3 pb-[env(safe-area-inset-bottom)] sm:px-6 transition-all duration-300 ${
            isMainContentInView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
          }`}
          style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
        >
          <motion.div
            className="mx-auto w-full max-w-4xl space-y-2 rounded-xl border border-border/80 bg-background/90 p-2.5 text-[0.95rem] shadow-lg backdrop-blur-md sm:space-y-3 sm:p-4 sm:text-sm"
            initial={shouldReduceMotion ? false : { scale: 0.98, opacity: 0 }}
            animate={shouldReduceMotion ? {} : { scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
              <div className="hidden flex-wrap items-center justify-between gap-2 sm:flex">
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Filter flags</p>
                <p className="text-base font-medium text-muted-foreground sm:text-sm">
                  Showing <span className="font-semibold tabular-nums text-foreground">{filteredFlags.length}</span> result
                  {filteredFlags.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="sm:hidden">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileFiltersExpanded((prev) => !prev)}
                  className="h-9 w-full justify-between rounded-lg border border-border bg-background px-3 text-sm font-semibold text-foreground hover:bg-muted"
                  aria-expanded={isMobileFiltersExpanded}
                  aria-controls="mobile-flag-filters"
                >
                  <span className="inline-flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    {isMobileFiltersExpanded ? "Hide filters" : "Filters"}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground tabular-nums">
                      {filteredFlags.length} flags
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isMobileFiltersExpanded ? "rotate-180" : "rotate-0"
                      }`}
                    />
                  </span>
                </Button>
              </div>
              <div
                id="mobile-flag-filters"
                className={`${isMobileFiltersExpanded ? "space-y-3" : "hidden"} sm:block sm:space-y-3`}
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                  <Input
                    placeholder="Search flags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-11 pl-10 text-base placeholder:text-sm sm:h-10 sm:text-sm"
                    aria-label="Search flags by name or description"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by category">
                  {categories.map((category) => {
                    const isActive = selectedCategory === category
                    return (
                      <Button
                        key={category}
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className={`h-9 whitespace-nowrap rounded-full border px-3 text-sm font-semibold tracking-tight transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
                          isActive
                            ? "border-foreground bg-foreground text-background hover:bg-foreground/90 hover:text-background"
                            : "border-border bg-background text-foreground hover:bg-muted"
                        }`}
                        aria-pressed={isActive}
                      >
                        <span>{category}</span>
                        <span
                          className={`ml-2 inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-1 text-xs font-semibold leading-none tabular-nums ${
                            isActive ? "bg-background/25 text-background" : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {getCategoryCount(category)}
                        </span>
                      </Button>
                    )
                  })}
                </div>
              </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
