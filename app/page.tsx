"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Heart, Search, BookOpen, Trophy, Sparkles, Flag, Info, HelpCircle, Share2 } from "lucide-react"
import HeroSection from "@/components/hero-section"
import { ThemeToggle } from "@/components/theme-toggle"
import { FlagCardTransition } from "@/components/flag-card-transition"
import { AnimatedFlag } from "@/components/animated-flag"

// Expanded flag data with more flags
const flags = [
  {
    id: "pride",
    name: "Pride Flag",
    colors: ["#e40303", "#ff8c00", "#ffed00", "#008018", "#004cff", "#732982"],
    description: "The original Pride flag represents the LGBTQIA+ community as a whole.",
    history:
      "Created by Gilbert Baker in 1978, each color has meaning: red for life, orange for healing, yellow for sunlight, green for nature, blue for harmony, and purple for spirit.",
    significance: "A universal symbol of LGBTQIA+ pride, diversity, and unity.",
    category: "General",
  },
  {
    id: "progress",
    name: "Progress Pride Flag",
    colors: [
      "#ffffff",
      "#f5a9b8",
      "#5bcefa",
      "#000000",
      "#8b4513",
      "#e40303",
      "#ff8c00",
      "#ffed00",
      "#008018",
      "#004cff",
      "#732982",
    ],
    description: "An inclusive redesign that centers marginalized communities within the LGBTQIA+ movement.",
    history:
      "Created by Daniel Quasar in 2018, adding black and brown stripes for people of color, and trans pride colors.",
    significance: "Represents progress toward inclusion and recognition of intersectionality.",
    category: "General",
  },
  {
    id: "transgender",
    name: "Transgender Pride Flag",
    colors: ["#5bcefa", "#f5a9b8", "#ffffff", "#f5a9b8", "#5bcefa"],
    description: "Represents the transgender community and gender identity.",
    history:
      "Created by Monica Helms in 1999. Light blue for boys, pink for girls, white for those transitioning or non-binary.",
    significance: "A symbol of transgender pride, visibility, and rights.",
    category: "Gender Identity",
  },
  {
    id: "bisexual",
    name: "Bisexual Pride Flag",
    colors: ["#d60270", "#9b59b6", "#0038a8"],
    description: "Represents bisexual identity and attraction to multiple genders.",
    history:
      "Created by Michael Page in 1998. Pink represents same-sex attraction, blue represents opposite-sex attraction, purple represents attraction to all genders.",
    significance: "Celebrates bisexual visibility and challenges misconceptions.",
    category: "Sexual Orientation",
  },
  {
    id: "lesbian",
    name: "Lesbian Pride Flag",
    colors: ["#d52d00", "#ef7627", "#ff9a56", "#ffffff", "#d162a4", "#b55690", "#a30262"],
    description: "Represents lesbian identity and women loving women.",
    history:
      "The current design was created in 2018, featuring orange for gender non-conformity, white for unique relationships, and pink for femininity.",
    significance: "Celebrates lesbian identity and community.",
    category: "Sexual Orientation",
  },
  {
    id: "gay",
    name: "Gay Men Pride Flag",
    colors: ["#078d70", "#26ceaa", "#98e8c1", "#ffffff", "#7bade2", "#5049cc", "#3d1a78"],
    description: "Represents gay men and their community.",
    history:
      "Created in 2019, featuring shades of green, blue, and purple to represent different aspects of gay male identity.",
    significance: "Provides specific representation for gay men within the broader LGBTQIA+ community.",
    category: "Sexual Orientation",
  },
  {
    id: "nonbinary",
    name: "Non-Binary Pride Flag",
    colors: ["#fcf434", "#ffffff", "#9c59d1", "#000000"],
    description: "Represents non-binary gender identities.",
    history:
      "Created by Kye Rowan in 2014. Yellow for those outside the gender binary, white for many or all genders, purple for mixed genders, black for lack of gender.",
    significance: "Validates and celebrates non-binary identities.",
    category: "Gender Identity",
  },
  {
    id: "pansexual",
    name: "Pansexual Pride Flag",
    colors: ["#ff218c", "#ffd800", "#21b1ff"],
    description: "Represents pansexual identity and attraction regardless of gender.",
    history: "Created in 2010. Pink represents attraction to women, yellow to non-binary people, and blue to men.",
    significance: "Celebrates attraction to all genders and challenges the gender binary.",
    category: "Sexual Orientation",
  },
  {
    id: "asexual",
    name: "Asexual Pride Flag",
    colors: ["#000000", "#a3a3a3", "#ffffff", "#800080"],
    description: "Represents asexual identity and the spectrum of asexuality.",
    history:
      "Created in 2010. Black for asexuality, grey for grey-asexuality and demisexuality, white for non-asexual partners, purple for community.",
    significance: "Validates asexual identities and promotes awareness.",
    category: "Sexual Orientation",
  },
  {
    id: "aromantic",
    name: "Aromantic Pride Flag",
    colors: ["#3da542", "#a7d379", "#ffffff", "#a9a9a9", "#000000"],
    description: "Represents aromantic identity and the spectrum of romantic attraction.",
    history:
      "Created in 2014. Green for aromanticism, light green for the aromantic spectrum, white for platonic relationships, grey for grey-aromantic and demiromantic people, black for the sexuality spectrum.",
    significance: "Validates aromantic identities and promotes understanding of romantic orientation diversity.",
    category: "Sexual Orientation",
  },
  {
    id: "demisexual",
    name: "Demisexual Pride Flag",
    colors: ["#000000", "#a3a3a3", "#ffffff", "#800080"],
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
    colors: ["#ff75a2", "#ffffff", "#be18d6", "#000000", "#333ebd"],
    description: "Represents genderfluid identity and fluctuating gender expression.",
    history:
      "Created by JJ Poole in 2012. Pink for femininity, white for lack of gender, purple for combination of masculinity and femininity, black for lack of gender, blue for masculinity.",
    significance: "Celebrates the fluidity of gender identity and expression.",
    category: "Gender Identity",
  },
  {
    id: "agender",
    name: "Agender Pride Flag",
    colors: ["#000000", "#c4c4c4", "#ffffff", "#b7f684", "#ffffff", "#c4c4c4", "#000000"],
    description: "Represents agender identity and the absence of gender.",
    history:
      "Created by Salem X in 2014. Black and white for absence of gender, grey for semi-genderlessness, green for non-binary genders.",
    significance: "Validates agender experiences and promotes understanding of gender diversity.",
    category: "Gender Identity",
  },
  {
    id: "polysexual",
    name: "Polysexual Pride Flag",
    colors: ["#f714ba", "#01d66a", "#1594f6"],
    description: "Represents polysexual identity and attraction to multiple, but not all, genders.",
    history:
      "Created in 2012. Pink represents attraction to women, green represents attraction to non-binary people, blue represents attraction to men.",
    significance: "Distinguishes polysexuality from pansexuality and celebrates attraction to multiple genders.",
    category: "Sexual Orientation",
  },
  {
    id: "omnisexual",
    name: "Omnisexual Pride Flag",
    colors: ["#fe9ace", "#ff6cab", "#ffffff", "#7902aa", "#ff6cab"],
    description:
      "Represents omnisexual identity and attraction to all genders with gender playing a role in attraction.",
    history:
      "Created in the 2010s. Pink shades represent attraction to femininity and women, white represents attraction to non-binary and gender non-conforming people, purple represents attraction to masculinity and men.",
    significance: "Distinguishes omnisexuality from pansexuality by acknowledging gender in attraction.",
    category: "Sexual Orientation",
  },
  {
    id: "intersex",
    name: "Intersex Pride Flag",
    colors: ["#ffd800", "#7902aa"],
    description: "Represents intersex people and their rights.",
    history:
      "Created by Morgan Carpenter in 2013. Yellow and purple were chosen as colors that are not associated with traditional gender binaries.",
    significance: "Advocates for intersex rights and bodily autonomy.",
    category: "General",
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
  const [selectedFlag, setSelectedFlag] = useState(null)
  const [cardRect, setCardRect] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [quizScore, setQuizScore] = useState(0)
  const [currentQuizQuestion, setCurrentQuizQuestion] = useState(0)
  const [showQuizResult, setShowQuizResult] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("All")

  const categories = ["All", "General", "Sexual Orientation", "Gender Identity"]

  const filteredFlags = flags.filter((flag) => {
    const matchesSearch =
      flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flag.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || flag.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Calculate consistent grid height based on total flags
  const gridHeight = useMemo(() => {
    // Estimate card height: ~280px per card + gap
    const cardHeight = 280
    const gap = 24
    const totalFlags = flags.length

    // Calculate rows needed for all flags in different breakpoints
    const mobileRows = Math.ceil(totalFlags / 1) // 1 column on mobile
    const tabletRows = Math.ceil(totalFlags / 2) // 2 columns on tablet
    const desktopRows = Math.ceil(totalFlags / 3) // 3 columns on desktop
    const largeRows = Math.ceil(totalFlags / 4) // 4 columns on large screens

    // Use the desktop calculation as base (3 columns)
    const baseHeight = desktopRows * (cardHeight + gap)

    return Math.max(baseHeight, 600) // Minimum 600px
  }, [])

  // Expanded quiz questions
  const quizQuestions = [
    {
      question: "Which flag was created by Gilbert Baker in 1978?",
      options: ["Pride Flag", "Transgender Flag", "Bisexual Flag", "Lesbian Flag"],
      correct: 0,
      flag: "pride",
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
      question: "What distinguishes omnisexuality from pansexuality?",
      options: [
        "Number of genders attracted to",
        "Gender plays a role in attraction",
        "Age of the identity",
        "Color of the flag",
      ],
      correct: 1,
      flag: "omnisexual",
    },
  ]

  const handleCardClick = (flag, event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setCardRect(rect)
    setSelectedFlag(flag)
  }

  const FlagCard = ({ flag }) => (
    <Card
      className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer flag-container"
      onClick={(event) => handleCardClick(flag, event)}
    >
      <CardHeader className="pb-2">
        <AnimatedFlag colors={flag.colors} className="h-24 rounded-lg overflow-hidden mb-2" speed={0.8} />
        <CardTitle className="text-lg flex items-center gap-2">
          <Flag className="w-5 h-5" />
          {flag.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">{flag.description}</p>

        {/* Card footer with badge and invisible share button for consistent height */}
        <div className="flex items-center justify-between">
          <Badge variant="secondary">{flag.category}</Badge>

          {/* Invisible share button to maintain consistent footer height */}
          <Button
            size="sm"
            variant="outline"
            style={{
              opacity: 0,
              pointerEvents: "none",
            }}
          >
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const QuizComponent = () => {
    const [selectedAnswer, setSelectedAnswer] = useState(null)
    const [answered, setAnswered] = useState(false)

    const handleAnswer = (answerIndex) => {
      if (answered) return
      setSelectedAnswer(answerIndex)
      setAnswered(true)

      if (answerIndex === quizQuestions[currentQuizQuestion].correct) {
        setQuizScore((prev) => prev + 1)
      }

      setTimeout(() => {
        if (currentQuizQuestion < quizQuestions.length - 1) {
          setCurrentQuizQuestion((prev) => prev + 1)
          setSelectedAnswer(null)
          setAnswered(false)
        } else {
          setShowQuizResult(true)
        }
      }, 1500)
    }

    const resetQuiz = () => {
      setCurrentQuizQuestion(0)
      setQuizScore(0)
      setSelectedAnswer(null)
      setAnswered(false)
      setShowQuizResult(false)
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
            <Button onClick={resetQuiz} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      )
    }

    const question = quizQuestions[currentQuizQuestion]
    const relatedFlag = flags.find((f) => f.id === question.flag)

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline">
              Question {currentQuizQuestion + 1}/{quizQuestions.length}
            </Badge>
            <Progress value={(currentQuizQuestion / quizQuestions.length) * 100} className="w-24" />
          </div>
          <CardTitle className="text-lg">{question.question}</CardTitle>
          {relatedFlag && <AnimatedFlag colors={relatedFlag.colors} className="h-16 rounded-lg mt-2" speed={0.6} />}
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <Button
                key={index}
                variant={
                  answered
                    ? index === question.correct
                      ? "default"
                      : selectedAnswer === index
                        ? "destructive"
                        : "outline"
                    : "outline"
                }
                className="w-full justify-start"
                onClick={() => handleAnswer(index)}
                disabled={answered}
              >
                {option}
                {answered && index === question.correct && " ✓"}
                {answered && selectedAnswer === index && index !== question.correct && " ✗"}
              </Button>
            ))}
          </div>
        </CardContent>
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
          <div className="container mx-auto px-4 py-12 max-w-7xl">
            {/* Header */}
            <div className="text-center mb-10 relative">
              <div className="absolute top-0 right-0">
                <ThemeToggle />
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-8 h-8 text-purple-600" />
                <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Pride Guide
                </h2>
              </div>
              <p className="text-muted-foreground">Celebrate diversity, learn with pride! 🏳️‍🌈</p>
            </div>

            <Tabs defaultValue="flags" className="w-full">
              <TabsList className="grid w-full grid-cols-4 max-w-md mx-auto mb-8">
                <TabsTrigger value="flags" className="text-xs sm:text-sm">
                  <Flag className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Flags</span>
                </TabsTrigger>
                <TabsTrigger value="quiz" className="text-xs sm:text-sm">
                  <Trophy className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Quiz</span>
                </TabsTrigger>
                <TabsTrigger value="ally" className="text-xs sm:text-sm">
                  <Heart className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Ally</span>
                </TabsTrigger>
                <TabsTrigger value="about" className="text-xs sm:text-sm">
                  <Info className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">About</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="flags" className="space-y-6">
                {/* Search and Filter */}
                <div className="space-y-4 max-w-md mx-auto">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Search flags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  <ScrollArea className="w-full">
                    <div className="flex gap-2 pb-2">
                      {categories.map((category) => (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(category)}
                          className="whitespace-nowrap"
                        >
                          {category}
                        </Button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                {/* Flag Grid - Fixed height container based on total flags */}
                <div style={{ minHeight: `${gridHeight}px` }} className="relative">
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredFlags.map((flag) => (
                      <FlagCard key={flag.id} flag={flag} />
                    ))}
                  </div>

                  {filteredFlags.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Card className="text-center py-8 max-w-md mx-auto">
                        <CardContent>
                          <p className="text-muted-foreground">No flags found matching your search.</p>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="quiz" className="space-y-6">
                <div className="text-center mb-6 max-w-md mx-auto">
                  <h2 className="text-2xl font-semibold mb-2">Flag Knowledge Quiz</h2>
                  <p className="text-muted-foreground">Test your knowledge about LGBTQIA+ flags!</p>
                </div>
                <div className="max-w-md mx-auto">
                  <QuizComponent />
                </div>
              </TabsContent>

              <TabsContent value="ally" className="space-y-6">
                <div className="text-center mb-6 max-w-md mx-auto">
                  <h2 className="text-2xl font-semibold mb-2">Ally Guide</h2>
                  <p className="text-muted-foreground">How to be a supportive ally</p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {allyTips.map((tip, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <HelpCircle className="w-5 h-5 text-blue-500" />
                          {tip.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{tip.content}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="about" className="space-y-6">
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
        </div>
      </div>
    </div>
  )
}
