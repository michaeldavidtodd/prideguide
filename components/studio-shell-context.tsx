"use client"

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from "react"
import {
  readSyncedCornerRadius,
  STUDIO_SHELL_SYNC_EVENT,
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

function getServerSnapshot() {
  return 0
}

function getClientSnapshot() {
  return readSyncedCornerRadius()
}

export type StudioShellValue = {
  cornerRadius: number
  studioShellStyle: CSSProperties | undefined
}

const defaultStudioShell: StudioShellValue = {
  cornerRadius: 0,
  studioShellStyle: undefined,
}

const StudioShellContext = createContext<StudioShellValue>(defaultStudioShell)

/** Mirrors Explore studio corner radius for Prism learn pages (localStorage + same-tab events). */
export function StudioShellProvider({ children }: { children: ReactNode }) {
  const cornerRadius = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot)
  const studioShellStyle = useMemo(
    (): CSSProperties | undefined =>
      cornerRadius > 0 ? { borderRadius: `${cornerRadius}px` } : undefined,
    [cornerRadius],
  )
  const value = useMemo(
    (): StudioShellValue => ({ cornerRadius, studioShellStyle }),
    [cornerRadius, studioShellStyle],
  )
  return <StudioShellContext.Provider value={value}>{children}</StudioShellContext.Provider>
}

export function useStudioShell(): StudioShellValue {
  return useContext(StudioShellContext)
}
