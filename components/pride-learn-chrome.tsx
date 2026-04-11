"use client"

import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { ExploreStudioSettingsPanel } from "@/components/explore-studio-settings-panel"
import { ExploreThemeMenuPanel } from "@/components/explore-theme-menu-panel"
import { PrismExpandableDock } from "@/components/prism-expandable-dock"
import { usePrismMotionReduced, useStudioShell } from "@/components/studio-shell-context"
import { resolveThemeDockTriggerIcon } from "@/lib/site-theme-meta"

/**
 * Persistent shell for the (learn) route group.
 * Renders the site header and expandable tab dock once;
 * `children` (the routed page) lives inside a div with `view-transition-name: learn-body`
 * so the body crossfades while header/dock stay put.
 */
export function PrideLearnShell({ children }: { children: ReactNode }) {
  return <PrideLearnShellInner>{children}</PrideLearnShellInner>
}

function PrideLearnShellInner({ children }: { children: ReactNode }) {
  const { theme, setTheme, themes: availableThemes } = useTheme()
  const [themeIconMounted, setThemeIconMounted] = useState(false)
  const {
    cornerRadius,
    studioShellStyle,
    motionPreference,
    studioPersist,
    setCornerRadius,
    setMotionPreference,
    setStudioPersist,
  } = useStudioShell()

  useEffect(() => {
    setThemeIconMounted(true)
  }, [])

  const ThemeDockIcon = resolveThemeDockTriggerIcon(theme, themeIconMounted, availableThemes)

  return (
    <>
      <div
        className="learn-body mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col pb-28 pt-6 px-6 sm:pt-8 lg:px-12"
      >
        {children}
      </div>

      <PrismExpandableDock
        style={studioShellStyle}
        chipsSoftCorners={cornerRadius > 0}
        appearanceTriggerIcon={<ThemeDockIcon className="size-3.5" aria-hidden />}
        appearancePanel={
          <ExploreThemeMenuPanel
            theme={theme}
            setTheme={setTheme}
            shellStyle={studioShellStyle}
            cornerRadius={cornerRadius}
            secondaryColumn={
              <ExploreStudioSettingsPanel
                variant="prism"
                studioShellStyle={studioShellStyle}
                cornerRadius={cornerRadius}
                motionPreference={motionPreference}
                onMotionPreferenceChange={setMotionPreference}
                setCornerRadius={setCornerRadius}
                studioPersist={studioPersist}
                onStudioPersistChange={setStudioPersist}
              />
            }
          />
        }
      />
    </>
  )
}

const learnIntroEase = [0.25, 1, 0.5, 1] as const

/** Staggered intro variants for Prism learn pages (opacity + translateY; honors reduced motion). */
export function useLearnPageIntroVariants() {
  const reduceMotion = usePrismMotionReduced()

  return useMemo(() => {
    const reduce = reduceMotion === true
    const duration = reduce ? 0.01 : 0.44
    const stagger = reduce ? 0 : 0.11
    const delayChildren = reduce ? 0 : 0.05
    const y = reduce ? 0 : 14

    return {
      containerVariants: {
        hidden: {},
        show: {
          transition: { staggerChildren: stagger, delayChildren },
        },
      },
      itemVariants: {
        hidden: { opacity: reduce ? 1 : 0, y },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration, ease: learnIntroEase },
        },
      },
    }
  }, [reduceMotion])
}

/**
 * Per-page content header (kicker, title, description) rendered inside the shell body.
 * Set `introAnimation` for a short staggered entrance (respects reduced motion).
 */
export function PrideLearnPageContent({
  kicker,
  title,
  description,
  children,
  wideLayout = false,
  introAnimation = false,
  /** When true with `introAnimation`, body is a stagger container — wrap sections in `motion.*` with `itemVariants` from `useLearnPageIntroVariants`. */
  introBodyStagger = false,
}: {
  kicker: string
  title: string
  description?: string
  children: ReactNode
  wideLayout?: boolean
  introAnimation?: boolean
  introBodyStagger?: boolean
}) {
  const { containerVariants, itemVariants } = useLearnPageIntroVariants()

  const headerClass = wideLayout ? "max-w-4xl lg:max-w-none" : "max-w-[min(100%,42rem)]"
  const kickerClass =
    "font-display text-[0.65rem] font-bold uppercase leading-none tracking-[0.28em] text-primary sm:text-[0.7rem]"
  const titleClass =
    "mt-3 font-display text-[clamp(1.75rem,4.5vw,2.5rem)] font-black leading-[1.08] tracking-tight"
  const descriptionClass =
    "mt-4 text-balance text-base leading-relaxed text-muted-foreground sm:mt-5 sm:text-[1.0625rem] sm:leading-[1.65]"

  if (!introAnimation) {
    return (
      <>
        <header className={headerClass}>
          <p className={kickerClass}>{kicker}</p>
          <h1 className={titleClass}>{title}</h1>
          {description ? <p className={descriptionClass}>{description}</p> : null}
        </header>
        <div className="mt-8 w-full sm:mt-12">{children}</div>
      </>
    )
  }

  return (
    <motion.div
      className="flex flex-col"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <header className={headerClass}>
        <motion.p className={kickerClass} variants={itemVariants}>
          {kicker}
        </motion.p>
        <motion.h1 className={titleClass} variants={itemVariants}>
          {title}
        </motion.h1>
        {description ? (
          <motion.p className={descriptionClass} variants={itemVariants}>
            {description}
          </motion.p>
        ) : null}
      </header>
      <motion.div
        className={
          introBodyStagger
            ? "mt-8 flex w-full flex-col gap-8 sm:mt-12"
            : "mt-8 w-full sm:mt-12"
        }
        variants={introBodyStagger ? containerVariants : itemVariants}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
