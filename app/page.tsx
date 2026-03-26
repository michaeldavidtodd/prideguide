"use client"

import type { MouseEvent as ReactMouseEvent } from "react"
import { useState, useMemo, useCallback, useEffect } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import confetti from "canvas-confetti"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Heart, Search, BookOpen, Trophy, Flag, Info } from "lucide-react"
import HeroSection from "@/components/hero-section"
import { ThemeToggle } from "@/components/theme-toggle"
import { FlagCardTransition } from "@/components/flag-card-transition"
import { AnimatedFlag } from "@/components/animated-flag"
import { FlagRingCarousel } from "@/components/flag-ring-carousel"

// At the top of the file, near other type definitions if any, or before 'flags'
interface SvgPathDefinition {
  id: string
  d: string
  fill: string
  transform?: string
  stroke?: string
  strokeWidth?: string
}

interface FlagDisplayData {
  stripes?: string[]
  svgForeground?: {
    viewBox: string
    paths: SvgPathDefinition[]
  }
}

interface FlagDefinition {
  id: string
  name: string
  display: FlagDisplayData
  description: string
  history: string
  significance: string
  category: string
}

// New flags constant
const flags: FlagDefinition[] = [
  {
    id: "original-pride",
    name: "Original Pride Flag",
    display: {
      stripes: ["#FF69B4", "#FF0000", "#FF8E00", "#FFFF00", "#008E00", "#00C0C0", "#400098", "#8E008E"],
    },
    description: "The original 8-color Pride flag that started the movement.",
    history:
      "Created by Gilbert Baker in 1978 with 8 colors: hot pink for sex, red for life, orange for healing, yellow for sunlight, green for nature, turquoise for magic/art, indigo for serenity, and violet for spirit. The hot pink and turquoise were later removed due to fabric availability.",
    significance: "The foundational symbol of LGBTQIA+ pride that inspired all subsequent pride flags.",
    category: "General",
  },
  {
    id: "pride",
    name: "Pride Flag",
    display: {
      stripes: ["#e40303", "#ff8c00", "#ffed00", "#008018", "#004cff", "#732982"],
    },
    description: "The widely recognized 6-color Pride flag representing the LGBTQIA+ community.",
    history:
      "The simplified 6-color version became standard after 1979. Red for life, orange for healing, yellow for sunlight, green for nature, blue for harmony, and purple for spirit.",
    significance: "The most recognized symbol of LGBTQIA+ pride, diversity, and unity worldwide.",
    category: "General",
  },
  {
    id: "progress",
    name: "Progress Pride Flag",
    display: {
      stripes: ["#e40303", "#ff8c00", "#ffed00", "#008018", "#004cff", "#732982"],
      svgForeground: {
        viewBox: "0 0 1025 654", // From your SVG example
        paths: [
          // Paths from your SVG, ordered for correct layering (bottom to top)
          {
            id: "progress-black-chevron",
            d: "M492 327.5L167.169 652H1V2H166.168L492 327.5Z",
            fill: "#000000",
          },
          {
            id: "progress-brown-chevron",
            d: "M410 327.5L84.1016 653H1V2H84.1016L410 327.5Z",
            fill: "#613915", // More accurate brown from your SVG
          },
          {
            id: "progress-lightblue-triangle",
            d: "M0.53418 0.0341797L327.534 326.534L0.53418 653.034V0.0341797Z",
            fill: "#5BCEFA", // Keeping color consistent with Trans flag
          },
          {
            id: "progress-pink-triangle",
            d: "M0.53418 82.5339L245.534 326.534L0.53418 570.534V82.5339Z",
            fill: "#F5A9B8", // Keeping color consistent with Trans flag
          },
          {
            id: "progress-white-triangle",
            d: "M1.06836 164.034L163.068 326.534L1.06836 489.034V164.034Z",
            fill: "#FFFFFF", // Keeping color consistent with Trans flag
          },
        ],
      },
    },
    description: "An inclusive redesign that centers marginalized communities within the LGBTQIA+ movement.",
    history:
      "Created by Daniel Quasar in 2018, adding black and brown stripes for people of color, and trans pride colors.",
    significance: "Represents progress toward inclusion and recognition of intersectionality.",
    category: "General",
  },
  {
    id: "transgender",
    name: "Transgender Pride Flag",
    display: {
      stripes: ["#5bcefa", "#f5a9b8", "#ffffff", "#f5a9b8", "#5bcefa"],
    },
    description: "Represents the transgender community and gender identity.",
    history:
      "Created by Monica Helms in 1999. Light blue for boys, pink for girls, white for those transitioning or non-binary.",
    significance: "A symbol of transgender pride, visibility, and rights.",
    category: "Gender Identity",
  },
  {
    id: "bisexual",
    name: "Bisexual Pride Flag",
    display: {
      stripes: ["#d60270", "#9b59b6", "#0038a8"],
    },
    description: "Represents bisexual identity and attraction to multiple genders.",
    history:
      "Created by Michael Page in 1998. Pink represents same-sex attraction, blue represents opposite-sex attraction, purple represents attraction to all genders.",
    significance: "Celebrates bisexual visibility and challenges misconceptions.",
    category: "Sexual Orientation",
  },
  {
    id: "lesbian",
    name: "Lesbian Pride Flag",
    display: {
      stripes: ["#d52d00", "#ef7627", "#ff9a56", "#ffffff", "#d162a4", "#b55690", "#a30262"],
    },
    description: "Represents lesbian identity and women loving women.",
    history:
      "The current design was created in 2018, featuring orange for gender non-conformity, white for unique relationships, and pink for femininity.",
    significance: "Celebrates lesbian identity and community.",
    category: "Sexual Orientation",
  },
  {
    id: "gay",
    name: "Gay Men Pride Flag",
    display: {
      stripes: ["#078d70", "#26ceaa", "#98e8c1", "#ffffff", "#7bade2", "#5049cc", "#3d1a78"],
    },
    description: "Represents gay men and their community.",
    history:
      "Created in 2019, featuring shades of green, blue, and purple to represent different aspects of gay male identity.",
    significance: "Provides specific representation for gay men within the broader LGBTQIA+ community.",
    category: "Sexual Orientation",
  },
  {
    id: "nonbinary",
    name: "Non-Binary Pride Flag",
    display: {
      stripes: ["#fcf434", "#ffffff", "#9c59d1", "#222222"],
    },
    description: "Represents non-binary gender identities.",
    history:
      "Created by Kye Rowan in 2014. Yellow for those outside the gender binary, white for many or all genders, purple for mixed genders, black for lack of gender.",
    significance: "Validates and celebrates non-binary identities.",
    category: "Gender Identity",
  },
  {
    id: "pansexual",
    name: "Pansexual Pride Flag",
    display: {
      stripes: ["#ff218c", "#ffd800", "#21b1ff"],
    },
    description: "Represents pansexual identity and attraction regardless of gender.",
    history: "Created in 2010. Pink represents attraction to women, yellow to non-binary people, and blue to men.",
    significance: "Celebrates attraction to all genders and challenges the gender binary.",
    category: "Sexual Orientation",
  },
  {
    id: "asexual",
    name: "Asexual Pride Flag",
    display: {
      stripes: ["#222222", "#a3a3a3", "#ffffff", "#800080"],
    },
    description: "Represents asexual identity and the spectrum of asexuality.",
    history:
      "Created in 2010. Black for asexuality, grey for grey-asexuality and demisexuality, white for non-asexual partners, purple for community.",
    significance: "Validates asexual identities and promotes awareness.",
    category: "Sexual Orientation",
  },
  {
    id: "intersex",
    name: "Intersex Pride Flag",
    display: {
      stripes: ["#ffd800"], // Solid yellow background
      svgForeground: {
        viewBox: "0 0 900 600", // Changed to match other flags' 3:2 aspect ratio
        paths: [
          // Circle centered in the 3:2 aspect ratio flag
          {
            id: "intersex-ring",
            d: "M450,300 m-110,0 a110,110 0 1,0 220,0 a110,110 0 1,0 -220,0", // Centered at y=300 instead of y=225
            stroke: "#7902AA",
            strokeWidth: "30",
            fill: "none",
          },
        ],
      },
    },
    description: "Represents intersex people and their rights.",
    history:
      "Created by Morgan Carpenter in 2013. Yellow and purple were chosen as colors that are not associated with traditional gender binaries.",
    significance: "Advocates for intersex rights and bodily autonomy.",
    category: "General",
  },
  // ... (other flags from previous version, ensure they follow the new structure)
  // Example for a stripe-only flag:
  {
    id: "aromantic",
    name: "Aromantic Pride Flag",
    display: {
      stripes: ["#3da542", "#a7d379", "#ffffff", "#a9a9a9", "#222222"],
    },
    description: "Represents aromantic identity and the spectrum of romantic attraction.",
    history:
      "Created in 2014. Green for aromanticism, light green for the aromantic spectrum, white for platonic relationships, grey for grey-aromantic and demiromantic people, black for the sexuality spectrum.",
    significance: "Validates aromantic identities and promotes understanding of romantic orientation diversity.",
    category: "Sexual Orientation",
  },
  {
    id: "demisexual",
    name: "Demisexual Pride Flag",
    display: {
      stripes: ["#222222", "#a3a3a3", "#ffffff", "#800080"], // Note: Same colors as Asexual flag, design often includes a black triangle. For simplicity, keeping as stripes for now unless a specific SVG design is requested.
    },
    description:
      "Represents demisexual identity, experiencing sexual attraction only after forming strong emotional bonds.",
    history:
      "Created in 2010. Black for asexuality, grey for grey-asexuality and demisexuality, white for sexuality, purple for community.",
    significance: "Validates demisexual experiences and promotes understanding of the asexual spectrum.",
    category: "Sexual Orientation",
  },
  {
    id: "genderfluid",
    name: "Genderfluid Pride Flag",
    display: {
      stripes: ["#ff75a2", "#ffffff", "#be18d6", "#222222", "#333ebd"],
    },
    description: "Represents genderfluid identity and fluctuating gender expression.",
    history:
      "Created by JJ Poole in 2012. Pink for femininity, white for lack of gender, purple for combination of masculinity and femininity, black for lack of gender, blue for masculinity.",
    significance: "Celebrates the fluidity of gender identity and expression.",
    category: "Gender Identity",
  },
  {
    id: "agender",
    name: "Agender Pride Flag",
    display: {
      stripes: ["#222222", "#c4c4c4", "#ffffff", "#b7f684", "#ffffff", "#c4c4c4", "#000000"],
    },
    description: "Represents agender identity and the absence of gender.",
    history:
      "Created by Salem X in 2014. Black and white for absence of gender, grey for semi-genderlessness, green for non-binary genders.",
    significance: "Validates agender experiences and promotes understanding of gender diversity.",
    category: "Gender Identity",
  },
  {
    id: "polysexual",
    name: "Polysexual Pride Flag",
    display: {
      stripes: ["#f714ba", "#01d66a", "#1594f6"],
    },
    description: "Represents polysexual identity and attraction to multiple, but not all, genders.",
    history:
      "Created in 2012. Pink represents attraction to women, green represents attraction to non-binary people, blue represents attraction to men.",
    significance: "Distinguishes polysexuality from pansexuality and celebrates attraction to multiple genders.",
    category: "Sexual Orientation",
  },
  {
    id: "omnisexual",
    name: "Omnisexual Pride Flag",
    display: {
      stripes: ["#fe9ace", "#ff6cab", "#ffffff", "#7902aa", "#ff6cab"], // Simplified to stripes for now. Actual flag has more distinct color blocks.
    },
    description:
      "Represents omnisexual identity and attraction to all genders with gender playing a role in attraction.",
    history:
      "Created in the 2010s. Pink shades represent attraction to femininity and women, white represents attraction to non-binary and gender non-conforming people, purple represents attraction to masculinity and men.",
    significance: "Distinguishes omnisexuality from pansexuality by acknowledging gender in attraction.",
    category: "Sexual Orientation",
  },
]

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
  const [cardRect, setCardRect] = useState<DOMRect | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [quizScore, setQuizScore] = useState(0)
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0)
  const [showQuizResult, setShowQuizResult] = useState(false)
  const [quizSelectedAnswer, setQuizSelectedAnswer] = useState<number | null>(null)
  const [quizAnswered, setQuizAnswered] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("All")
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

  const handleCardClick = (flag: FlagDefinition, event: ReactMouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setCardRect(rect)
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
            <header className="relative mb-12 flex flex-col gap-6 sm:mb-14 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl text-left">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                  Prism · queer flag wiki
                </p>
                <h2 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                  Pride Guide
                </h2>
                <span
                  className="mt-4 block h-2 w-40 max-w-full sm:w-56"
                  style={{
                    background:
                      "linear-gradient(90deg, #e40303 0%, #ff8c00 16.6%, #ffed00 33.3%, #008018 50%, #004cff 66.6%, #732982 83.3%, #e40303 100%)",
                  }}
                  aria-hidden
                />
                <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg text-balance">
                  Learn the symbols for real. History and meaning—loud, clear, and unapologetic.
                </p>
              </div>
              <div className="flex shrink-0 justify-start sm:justify-end sm:pb-1">
                <ThemeToggle />
              </div>
            </header>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="relative mb-8 grid h-auto w-full max-w-none grid-cols-4 gap-1 rounded-xl border border-border/70 bg-muted/40 p-1">
                <motion.div
                  aria-hidden
                  className="pointer-events-none absolute bottom-0 left-0 w-1/4"
                  animate={shouldReduceMotion ? undefined : { x: `${activeTabIndex * 100}%` }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="mx-auto h-0.5 w-1/2 bg-gradient-to-r from-[#e40303] via-[#ffed00] to-[#004cff] [mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,black_18%,black_82%,transparent)]" />
                </motion.div>
                <TabsTrigger
                  value="flags"
                  className="rounded-lg border border-transparent px-2 py-2.5 text-xs font-semibold tracking-wide text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-background/60 hover:text-foreground data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:px-3 sm:py-3 sm:text-sm"
                >
                  <Flag className="mr-1.5 h-4 w-4 sm:mr-2" />
                  <span>Flags</span>
                </TabsTrigger>
                <TabsTrigger
                  value="quiz"
                  className="rounded-lg border border-transparent px-2 py-2.5 text-xs font-semibold tracking-wide text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-background/60 hover:text-foreground data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:px-3 sm:py-3 sm:text-sm"
                >
                  <Trophy className="mr-1.5 h-4 w-4 sm:mr-2" />
                  <span>Quiz</span>
                </TabsTrigger>
                <TabsTrigger
                  value="ally"
                  className="rounded-lg border border-transparent px-2 py-2.5 text-xs font-semibold tracking-wide text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-background/60 hover:text-foreground data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:px-3 sm:py-3 sm:text-sm"
                >
                  <Heart className="mr-1.5 h-4 w-4 sm:mr-2" />
                  <span>Ally</span>
                </TabsTrigger>
                <TabsTrigger
                  value="about"
                  className="rounded-lg border border-transparent px-2 py-2.5 text-xs font-semibold tracking-wide text-muted-foreground transition-all duration-200 hover:-translate-y-0.5 hover:bg-background/60 hover:text-foreground data-[state=active]:border-border data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm sm:px-3 sm:py-3 sm:text-sm"
                >
                  <Info className="mr-1.5 h-4 w-4 sm:mr-2" />
                  <span>About</span>
                </TabsTrigger>
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
              cardRect={cardRect}
              isOpen={!!selectedFlag}
              onClose={() => {
                setSelectedFlag(null)
                setCardRect(null)
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
            className={`fixed bottom-6 inset-x-0 z-50  px-4 sm:px-6 transition-all duration-300 ${
            isMainContentInView ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"
          }`}
        >
          <motion.div
            className="mx-auto w-full max-w-4xl space-y-3 rounded-xl border border-border/80 bg-background/85 p-3 shadow-lg backdrop-blur-md sm:p-4"
            initial={shouldReduceMotion ? false : { scale: 0.98, opacity: 0 }}
            animate={shouldReduceMotion ? {} : { scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Filter flags</p>
                <p className="text-xs text-muted-foreground">
                  Showing <span className="font-semibold text-foreground">{filteredFlags.length}</span> result
                  {filteredFlags.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <Input
                  placeholder="Search flags..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-10 pl-10"
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
                      className={`h-9 whitespace-nowrap rounded-full border px-3 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 ${
                        isActive
                          ? "border-foreground bg-foreground text-background hover:bg-foreground/90 hover:text-background"
                          : "border-border bg-background text-foreground hover:bg-muted"
                      }`}
                      aria-pressed={isActive}
                    >
                      <span>{category}</span>
                      <span
                        className={`ml-2 inline-flex min-w-6 items-center justify-center rounded-full px-1.5 text-[11px] leading-none ${
                          isActive ? "bg-background/25 text-background" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {getCategoryCount(category)}
                      </span>
                    </Button>
                  )
                })}
              </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
