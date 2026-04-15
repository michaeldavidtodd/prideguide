"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { usePathname } from "next/navigation"
import { useStudioShell } from "@/components/studio-shell-context"
import {
  LS_EXPLORE_STUDIO,
  type ExploreStudioSnapshot,
  parseExploreStudioSnapshot,
  randomExploreStudioSnapshot,
} from "@/lib/explore-studio-persist"
import { PRIDE_EXPLORE_PATH, PRIDE_QUIZ_PATH } from "@/lib/pride-routes"
import { notifyStudioShellSync } from "@/lib/studio-shell-sync"

function pathUsesLiveExploreSlice(pathname: string | null): boolean {
  if (!pathname) return false
  return pathname === PRIDE_EXPLORE_PATH || pathname === PRIDE_QUIZ_PATH
}

export type ExploreStudioSliceContextValue = {
  columnCount: number
  setColumnCount: (n: number) => void
  stripeGap: number
  setStripeGap: (n: number) => void
  waveBoost: boolean
  setWaveBoost: (b: boolean) => void
  explorePrefsHydrated: boolean
  onStudioPersistChange: (persist: boolean) => void
}

const defaultExploreStudioSlice: ExploreStudioSliceContextValue = {
  columnCount: 18,
  setColumnCount: () => {},
  stripeGap: 0,
  setStripeGap: () => {},
  waveBoost: false,
  setWaveBoost: () => {},
  explorePrefsHydrated: false,
  onStudioPersistChange: () => {},
}

const ExploreStudioSliceContext = createContext<ExploreStudioSliceContextValue>(defaultExploreStudioSlice)

/**
 * Shared Explore slice state (columns, gap, wave) + persist hydration for /explore and /quiz.
 * Avoids randomizing studio corners on other Prism routes when “Save” is off.
 */
export function ExploreStudioSliceProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const sliceRoutes = pathUsesLiveExploreSlice(pathname)
  const { cornerRadius, studioPersist, setStudioPersist, setCornerRadius } = useStudioShell()
  const [explorePrefsHydrated, setExplorePrefsHydrated] = useState(false)
  const [waveBoost, setWaveBoost] = useState(false)
  const [columnCount, setColumnCount] = useState(18)
  const [stripeGap, setStripeGap] = useState(0)

  const applyStudioSnapshot = useCallback(
    (s: ExploreStudioSnapshot) => {
      setColumnCount(s.columnCount)
      setWaveBoost(s.waveBoost)
      setStripeGap(s.stripeGap)
      setCornerRadius(s.cornerRadius)
    },
    [setCornerRadius],
  )

  const onStudioPersistChange = useCallback(
    (persist: boolean) => {
      setStudioPersist(persist)
      if (!persist) return
      try {
        localStorage.setItem(
          LS_EXPLORE_STUDIO,
          JSON.stringify({
            columnCount,
            waveBoost,
            stripeGap,
            cornerRadius,
          } satisfies ExploreStudioSnapshot),
        )
        notifyStudioShellSync()
      } catch {
        /* ignore */
      }
    },
    [columnCount, cornerRadius, setStudioPersist, stripeGap, waveBoost],
  )

  useEffect(() => {
    try {
      if (studioPersist) {
        const raw = localStorage.getItem(LS_EXPLORE_STUDIO)
        const parsed = raw ? (JSON.parse(raw) as unknown) : null
        const snap = parseExploreStudioSnapshot(parsed)
        if (snap) {
          applyStudioSnapshot(snap)
        } else {
          const r = randomExploreStudioSnapshot()
          applyStudioSnapshot(r)
          localStorage.setItem(LS_EXPLORE_STUDIO, JSON.stringify(r))
          notifyStudioShellSync()
        }
      } else if (sliceRoutes) {
        applyStudioSnapshot(randomExploreStudioSnapshot())
      }
    } catch {
      if (sliceRoutes) {
        applyStudioSnapshot(randomExploreStudioSnapshot())
      }
    }
    setExplorePrefsHydrated(true)
  }, [applyStudioSnapshot, sliceRoutes, studioPersist])

  useEffect(() => {
    if (!explorePrefsHydrated || !studioPersist) return
    try {
      localStorage.setItem(
        LS_EXPLORE_STUDIO,
        JSON.stringify({
          columnCount,
          waveBoost,
          stripeGap,
          cornerRadius,
        } satisfies ExploreStudioSnapshot),
      )
      notifyStudioShellSync()
    } catch {
      /* ignore */
    }
  }, [columnCount, cornerRadius, explorePrefsHydrated, stripeGap, studioPersist, waveBoost])

  const value = useMemo(
    (): ExploreStudioSliceContextValue => ({
      columnCount,
      setColumnCount,
      stripeGap,
      setStripeGap,
      waveBoost,
      setWaveBoost,
      explorePrefsHydrated,
      onStudioPersistChange,
    }),
    [
      columnCount,
      explorePrefsHydrated,
      onStudioPersistChange,
      stripeGap,
      waveBoost,
    ],
  )

  return (
    <ExploreStudioSliceContext.Provider value={value}>{children}</ExploreStudioSliceContext.Provider>
  )
}

export function useExploreStudioSlice(): ExploreStudioSliceContextValue {
  return useContext(ExploreStudioSliceContext)
}
