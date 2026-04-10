"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react"
import { useReducedMotion } from "framer-motion"
import {
  notifyStudioShellSync,
  readSyncedCornerRadius,
  readSyncedMotionPreference,
  readSyncedStudioPersist,
  STUDIO_SHELL_SYNC_EVENT,
  writeSyncedCornerRadius,
  writeSyncedMotionPreference,
  writeSyncedStudioPersist,
  type StudioMotionPreference,
} from "@/lib/studio-shell-sync"

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => {}
  const handler = () => onStoreChange()
  window.addEventListener(STUDIO_SHELL_SYNC_EVENT, handler)
  window.addEventListener("storage", handler)
  return () => {
    window.removeEventListener(STUDIO_SHELL_SYNC_EVENT, handler)
    window.removeEventListener("storage", handler)
  }
}

type StudioPrefsSnapshot = {
  cornerRadius: number
  motionPreference: StudioMotionPreference
  studioPersist: boolean
}

let clientSnapshotCache: StudioPrefsSnapshot | null = null

/** Stable reference — React requires getServerSnapshot to return a cached value. */
const SERVER_STUDIO_PREFS_SNAPSHOT: StudioPrefsSnapshot = {
  cornerRadius: 0,
  motionPreference: "system",
  studioPersist: false,
}

function getServerSnapshot(): StudioPrefsSnapshot {
  return SERVER_STUDIO_PREFS_SNAPSHOT
}

function getClientSnapshot(): StudioPrefsSnapshot {
  const cornerRadius = readSyncedCornerRadius()
  const motionPreference = readSyncedMotionPreference()
  const studioPersist = readSyncedStudioPersist()
  if (
    clientSnapshotCache &&
    clientSnapshotCache.cornerRadius === cornerRadius &&
    clientSnapshotCache.motionPreference === motionPreference &&
    clientSnapshotCache.studioPersist === studioPersist
  ) {
    return clientSnapshotCache
  }
  clientSnapshotCache = { cornerRadius, motionPreference, studioPersist }
  return clientSnapshotCache
}

export type StudioShellValue = {
  cornerRadius: number
  motionPreference: StudioMotionPreference
  studioPersist: boolean
  studioShellStyle: CSSProperties | undefined
  setCornerRadius: (n: number) => void
  setMotionPreference: (value: StudioMotionPreference) => void
  setStudioPersist: (persist: boolean) => void
}

const defaultStudioShell: StudioShellValue = {
  cornerRadius: 0,
  motionPreference: "system",
  studioPersist: false,
  studioShellStyle: undefined,
  setCornerRadius: () => {},
  setMotionPreference: () => {},
  setStudioPersist: () => {},
}

const StudioShellContext = createContext<StudioShellValue>(defaultStudioShell)

/** Mirrors Prism studio prefs (corner, motion, persist) from localStorage + same-tab events. */
export function StudioShellProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)

  const setCornerRadius = useCallback((n: number) => {
    writeSyncedCornerRadius(n)
    notifyStudioShellSync()
  }, [])

  const setMotionPreference = useCallback((value: StudioMotionPreference) => {
    writeSyncedMotionPreference(value)
  }, [])

  const setStudioPersist = useCallback((persist: boolean) => {
    writeSyncedStudioPersist(persist)
  }, [])

  const studioShellStyle = useMemo(
    (): CSSProperties | undefined =>
      snapshot.cornerRadius > 0 ? { borderRadius: `${snapshot.cornerRadius}px` } : undefined,
    [snapshot.cornerRadius],
  )

  const value = useMemo(
    (): StudioShellValue => ({
      cornerRadius: snapshot.cornerRadius,
      motionPreference: snapshot.motionPreference,
      studioPersist: snapshot.studioPersist,
      studioShellStyle,
      setCornerRadius,
      setMotionPreference,
      setStudioPersist,
    }),
    [
      setCornerRadius,
      setMotionPreference,
      setStudioPersist,
      snapshot.cornerRadius,
      snapshot.motionPreference,
      snapshot.studioPersist,
      studioShellStyle,
    ],
  )

  return <StudioShellContext.Provider value={value}>{children}</StudioShellContext.Provider>
}

export function useStudioShell(): StudioShellValue {
  return useContext(StudioShellContext)
}

/** Honors Motion dock setting: reduce / full / system (OS). */
export function usePrismMotionReduced(): boolean {
  const systemPrefersReduced = useReducedMotion()
  const { motionPreference } = useStudioShell()
  if (motionPreference === "reduce") return true
  if (motionPreference === "full") return false
  return systemPrefersReduced === true
}
