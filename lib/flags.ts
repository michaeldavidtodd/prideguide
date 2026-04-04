export interface SvgPathDefinition {
  id: string
  d: string
  fill: string
  transform?: string
  stroke?: string
  strokeWidth?: string
}

export interface FlagDisplayData {
  stripes?: string[]
  svgForeground?: {
    viewBox: string
    paths: SvgPathDefinition[]
  }
}

export interface FlagDefinition {
  id: string
  name: string
  display: FlagDisplayData
  description: string
  history: string
  significance: string
  category: string
}

export const PRIDE_FLAGS: FlagDefinition[] = [
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
        viewBox: "0 0 1025 654",
        paths: [
          {
            id: "progress-black-chevron",
            d: "M492 327.5L167.169 652H1V2H166.168L492 327.5Z",
            fill: "#000000",
          },
          {
            id: "progress-brown-chevron",
            d: "M410 327.5L84.1016 653H1V2H84.1016L410 327.5Z",
            fill: "#613915",
          },
          {
            id: "progress-lightblue-triangle",
            d: "M0.53418 0.0341797L327.534 326.534L0.53418 653.034V0.0341797Z",
            fill: "#5BCEFA",
          },
          {
            id: "progress-pink-triangle",
            d: "M0.53418 82.5339L245.534 326.534L0.53418 570.534V82.5339Z",
            fill: "#F5A9B8",
          },
          {
            id: "progress-white-triangle",
            d: "M1.06836 164.034L163.068 326.534L1.06836 489.034V164.034Z",
            fill: "#FFFFFF",
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
      stripes: ["#ffd800"],
      svgForeground: {
        viewBox: "0 0 900 600",
        paths: [
          {
            id: "intersex-ring",
            d: "M450,300 m-110,0 a110,110 0 1,0 220,0 a110,110 0 1,0 -220,0",
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
      stripes: ["#222222", "#a3a3a3", "#ffffff", "#800080"],
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
      stripes: ["#fe9ace", "#ff6cab", "#ffffff", "#7902aa", "#ff6cab"],
    },
    description:
      "Represents omnisexual identity and attraction to all genders with gender playing a role in attraction.",
    history:
      "Created in the 2010s. Pink shades represent attraction to femininity and women, white represents attraction to non-binary and gender non-conforming people, purple represents attraction to masculinity and men.",
    significance: "Distinguishes omnisexuality from pansexuality by acknowledging gender in attraction.",
    category: "Sexual Orientation",
  },
]
