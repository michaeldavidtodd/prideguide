export type QuizQuestion = {
  question: string
  options: string[]
  correct: number
  flag: string
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
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
