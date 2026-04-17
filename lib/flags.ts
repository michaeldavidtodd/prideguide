export interface SvgPathDefinition {
  id: string
  d: string
  fill: string
  transform?: string
  stroke?: string
  strokeWidth?: string
  /** What this shape or stroke represents (shown in the color palette). */
  meaning?: string
}

export interface FlagDisplayData {
  stripes?: string[]
  /** Same length as `stripes` when set — what each horizontal band represents. */
  stripeMeanings?: string[]
  /**
   * Same length as `stripes` when set: relative band heights (any positive numbers, normalized).
   * When omitted, horizontal bands are equal height.
   */
  stripeFractions?: number[]
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

function parseHexChannels(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.trim().replace(/^#/, "")
  if (!h) return null
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h
  if (full.length !== 6) return null
  const n = Number.parseInt(full, 16)
  if (Number.isNaN(n)) return null
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}

/** Lowercase `#rrggbb` when parsable; otherwise `null`. */
export function canonicalFlagHex(input: string): string | null {
  const rgb = parseHexChannels(input)
  if (!rgb) return null
  return `#${[rgb.r, rgb.g, rgb.b].map((x) => x.toString(16).padStart(2, "0")).join("")}`
}

function formatSvgPathLabel(id: string): string {
  return id
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
}

export interface FlagPaletteSwatch {
  hex: string
  /** 1-based index along the palette strip */
  index: number
  label: string
  /** Symbolic meaning when provided in flag data */
  meaning?: string
}

/**
 * One swatch per horizontal band (in order), then each SVG fill/stroke in path order.
 * Same hex can appear more than once when different bands or shapes use it.
 */
export function collectFlagPalette(display: FlagDisplayData): FlagPaletteSwatch[] {
  const out: FlagPaletteSwatch[] = []
  let n = 0

  const meanings = display.stripeMeanings

  const push = (raw: string, label: string, meaning?: string) => {
    const trimmed = raw.trim()
    if (!trimmed || trimmed.toLowerCase() === "none") return
    n += 1
    const hex = canonicalFlagHex(trimmed) ?? trimmed
    const entry: FlagPaletteSwatch = { hex, index: n, label }
    if (meaning?.trim()) entry.meaning = meaning.trim()
    out.push(entry)
  }

  const stripes = display.stripes ?? []
  for (let i = 0; i < stripes.length; i++) {
    push(stripes[i]!, `Band ${i + 1}`, meanings?.[i])
  }

  for (const p of display.svgForeground?.paths ?? []) {
    const base = formatSvgPathLabel(p.id)
    if (p.fill?.trim() && p.fill.toLowerCase() !== "none") {
      push(p.fill, base, p.meaning)
    }
    if (p.stroke?.trim() && p.stroke.toLowerCase() !== "none") {
      const strokeLabel =
        p.fill?.trim() && p.fill.toLowerCase() !== "none" ? `${base} · outline` : base
      push(p.stroke, strokeLabel, p.meaning)
    }
  }

  return out
}

export interface FlagStripeCssStop {
  color: string
  fromPct: number
  toPct: number
}

/** Percentage ranges for `linear-gradient(to bottom, …)` (0% = top). */
export function flagStripeCssStops(
  colors: readonly string[],
  fractions?: readonly number[] | undefined,
): FlagStripeCssStop[] {
  const n = colors.length
  if (n === 0) return []
  if (n === 1) return [{ color: colors[0]!, fromPct: 0, toPct: 100 }]

  const okFrac =
    fractions !== undefined &&
    fractions.length === n &&
    fractions.every((f) => Number.isFinite(f) && f > 0)

  const edges = new Array<number>(n + 1)
  edges[0] = 0
  if (okFrac) {
    const sum = fractions!.reduce((a, b) => a + b, 0)
    if (sum <= 0) {
      for (let i = 1; i <= n; i++) edges[i] = i / n
    } else {
      let acc = 0
      for (let i = 0; i < n; i++) {
        acc += fractions![i]! / sum
        edges[i + 1] = i === n - 1 ? 1 : acc
      }
    }
  } else {
    for (let i = 1; i <= n; i++) edges[i] = i / n
  }

  return colors.map((color, i) => ({
    color,
    fromPct: Math.round(edges[i]! * 10000) / 100,
    toPct: Math.round(edges[i + 1]! * 10000) / 100,
  }))
}

/** Normalized band heights (sum 1). `null` means equal `1/n` bands. */
export function normalizedStripeHeights(
  stripeCount: number,
  fractions?: readonly number[] | undefined,
): number[] | null {
  if (stripeCount <= 1) return null
  const ok =
    fractions !== undefined &&
    fractions.length === stripeCount &&
    fractions.every((f) => Number.isFinite(f) && f > 0)
  if (!ok) return null
  const sum = fractions!.reduce((a, b) => a + b, 0)
  if (sum <= 0) return null
  return fractions!.map((w) => w / sum)
}

export const PRIDE_FLAGS: FlagDefinition[] = [
  {
    id: "original-pride",
    name: "Original Pride Flag",
    display: {
      stripes: ["#FF69B4", "#FF0000", "#FF8E00", "#FFFF00", "#008E00", "#00C0C0", "#400098", "#8E008E"],
      stripeMeanings: [
        "Sex",
        "Life",
        "Healing",
        "Sunlight",
        "Nature",
        "Magic and art",
        "Serenity",
        "Spirit",
      ],
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
      stripeMeanings: ["Life", "Healing", "Sunlight", "Nature", "Harmony", "Spirit"],
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
      stripeMeanings: ["Life", "Healing", "Sunlight", "Nature", "Harmony", "Spirit"],
      svgForeground: {
        /*
         * 3:2 canvas (1025×684) to match stripe-only flags. Path coords are the original
         * 1025×654 Quasar geometry uniformly scaled by 684/654 about the origin.
         */
        viewBox: "0 0 1025 684",
        paths: [
          {
            id: "progress-black-chevron",
            d: "M514.5688 342.5229L174.8373 684H0V0H173.7904L514.5688 342.5229Z",
            fill: "#000000",
            meaning: "Black and LGBTQIA+ communities of color",
          },
          {
            id: "progress-brown-chevron",
            d: "M428.8073 342.5229L87.9595 684H0V0H87.9595L428.8073 342.5229Z",
            fill: "#613915",
            meaning: "Brown and LGBTQIA+ communities of color",
          },
          {
            id: "progress-lightblue-triangle",
            d: "M0 0L342.5585 341.5126L0 684Z",
            fill: "#5BCEFA",
            meaning: "Trans pride — light blue (often read as boys / trans masculine)",
          },
          {
            id: "progress-pink-triangle",
            d: "M0 86.3199L256.797 341.5126L0 596.7053V86.3199Z",
            fill: "#F5A9B8",
            meaning: "Trans pride — pink (often read as girls / trans feminine)",
          },
          {
            id: "progress-white-triangle",
            d: "M0 171.5585L170.5482 341.5126L0 511.4668V171.5585Z",
            fill: "#FFFFFF",
            meaning: "Trans pride — center for those transitioning or outside the binary",
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
      stripeMeanings: [
        "Boys and trans masculine people (traditional reading)",
        "Girls and trans feminine people (traditional reading)",
        "Those transitioning or who are non-binary",
        "Girls and trans feminine people (traditional reading)",
        "Boys and trans masculine people (traditional reading)",
      ],
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
      stripeFractions: [2, 1, 2],
      stripeMeanings: [
        "Same-gender attraction",
        "Attraction across the spectrum",
        "Different-gender attraction",
      ],
    },
    description: "Represents bisexual identity and attraction to multiple genders.",
    history:
      "Created by Michael Page in 1998. Pink and blue stripes are twice the height of the center lavender band (40% / 20% / 40%). Pink represents same-sex attraction, blue opposite-sex attraction, lavender the blend across the spectrum.",
    significance: "Celebrates bisexual visibility and challenges misconceptions.",
    category: "Sexual Orientation",
  },
  {
    id: "lesbian",
    name: "Lesbian Pride Flag",
    display: {
      stripes: ["#d52d00", "#ef7627", "#ff9a56", "#ffffff", "#d162a4", "#b55690", "#a30262"],
      stripeMeanings: [
        "Gender nonconformity",
        "Independence",
        "Community",
        "Unique relationships to womanhood",
        "Serenity and peace",
        "Love and sex",
        "Femininity",
      ],
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
      stripeMeanings: [
        "Teaching",
        "Nature",
        "Healing",
        "Sunlight",
        "Serenity",
        "Art",
        "Spirit",
      ],
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
      stripeMeanings: [
        "People whose gender sits outside the binary",
        "People with many or all genders",
        "People whose gender mixes masculine and feminine",
        "People who are agender or without gender",
      ],
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
      stripeMeanings: ["Attraction to women", "Attraction to non-binary people", "Attraction to men"],
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
      stripeMeanings: ["Asexuality", "Grey-asexuality and demisexuality", "Allyship and non-asexual partners", "Community"],
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
      stripeMeanings: ["A hue intentionally outside traditional gender-color associations"],
      svgForeground: {
        viewBox: "0 0 900 600",
        paths: [
          {
            id: "intersex-ring",
            d: "M450,300 m-110,0 a110,110 0 1,0 220,0 a110,110 0 1,0 -220,0",
            stroke: "#7902AA",
            strokeWidth: "30",
            fill: "none",
            meaning: "Unbroken circle — bodily autonomy and wholeness for intersex people",
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
      stripeMeanings: [
        "Aromanticism",
        "The aromantic spectrum",
        "Platonic and non-romantic bonds",
        "Grey-aromantic and demiromantic experiences",
        "The broader sexuality spectrum alongside aromanticism",
      ],
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
      stripes: ["#ffffff", "#7e277d", "#a3a3a3"],
      stripeFractions: [41, 26, 41],
      stripeMeanings: ["Sexuality when it emerges", "Community", "Grey-asexuality and demisexuality"],
      svgForeground: {
        viewBox: "0 0 159 108",
        paths: [
          {
            id: "demisexual-chevron",
            d: "M69.0337 54L0.0336914 108V0L69.0337 54Z",
            fill: "#030404",
            meaning: "Asexuality",
          },
        ],
      },
    },
    description:
      "Represents demisexual identity, experiencing sexual attraction only after forming strong emotional bonds.",
    history:
      "Created in 2010. Black for asexuality, grey for grey-asexuality and demisexuality, white for sexuality, purple for community — with the black chevron on the hoist as on the original design.",
    significance: "Validates demisexual experiences and promotes understanding of the asexual spectrum.",
    category: "Sexual Orientation",
  },
  {
    id: "genderfluid",
    name: "Genderfluid Pride Flag",
    display: {
      stripes: ["#ff75a2", "#ffffff", "#be18d6", "#222222", "#333ebd"],
      stripeMeanings: [
        "Femininity",
        "Absence of gender",
        "Both masculinity and femininity",
        "Absence of gender",
        "Masculinity",
      ],
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
      stripeMeanings: [
        "Absence of gender",
        "Semi-genderlessness or partial gender",
        "Absence of gender",
        "Non-binary genders",
        "Absence of gender",
        "Semi-genderlessness or partial gender",
        "Absence of gender",
      ],
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
      stripeMeanings: ["Attraction to women", "Attraction to non-binary people", "Attraction to men"],
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
      stripeMeanings: [
        "Attraction to femininity and women",
        "Attraction to femininity and women (deeper tone)",
        "Attraction to non-binary and gender-nonconforming people",
        "Attraction to masculinity and men",
        "Attraction to femininity and women",
      ],
    },
    description:
      "Represents omnisexual identity and attraction to all genders with gender playing a role in attraction.",
    history:
      "Created in the 2010s. Pink shades represent attraction to femininity and women, white represents attraction to non-binary and gender non-conforming people, purple represents attraction to masculinity and men.",
    significance: "Distinguishes omnisexuality from pansexuality by acknowledging gender in attraction.",
    category: "Sexual Orientation",
  },
]
