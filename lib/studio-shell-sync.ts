/** Cross-page sync for Explore “rounded edges” (studio corner radius). */
export const LS_STUDIO_CORNER_SYNC = "prideguide-studio-corner-v1"

/** Motion override (shared across Prism routes). Key name kept for existing users. */
export const LS_PRISM_MOTION_PREF = "prideguide-explore-motion-pref"

/** Persist studio prefs + Explore slice snapshot when on. Key name kept for existing users. */
export const LS_PRISM_STUDIO_PERSIST = "prideguide-explore-studio-persist"

export const STUDIO_SHELL_SYNC_EVENT = "prideguide:studio-shell-sync"

export type StudioMotionPreference = "system" | "reduce" | "full"

export function clampStudioCornerRadius(n: number): number {
  return Math.min(28, Math.max(0, Math.round(n)))
}

export function readSyncedCornerRadius(): number {
  if (typeof window === "undefined") return 0
  try {
    const raw = localStorage.getItem(LS_STUDIO_CORNER_SYNC)
    if (!raw) return 0
    const o = JSON.parse(raw) as { cornerRadius?: unknown }
    if (typeof o.cornerRadius === "number" && Number.isFinite(o.cornerRadius)) {
      return clampStudioCornerRadius(o.cornerRadius)
    }
  } catch {
    /* ignore */
  }
  return 0
}

export function writeSyncedCornerRadius(cornerRadius: number): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(
      LS_STUDIO_CORNER_SYNC,
      JSON.stringify({ cornerRadius: clampStudioCornerRadius(cornerRadius) }),
    )
  } catch {
    /* ignore quota / private mode */
  }
}

export function notifyStudioShellSync(): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(STUDIO_SHELL_SYNC_EVENT))
}

export function readSyncedMotionPreference(): StudioMotionPreference {
  if (typeof window === "undefined") return "system"
  try {
    const raw = localStorage.getItem(LS_PRISM_MOTION_PREF)
    if (raw === "system" || raw === "reduce" || raw === "full") return raw
  } catch {
    /* ignore */
  }
  return "system"
}

export function writeSyncedMotionPreference(value: StudioMotionPreference): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(LS_PRISM_MOTION_PREF, value)
  } catch {
    /* ignore quota / private mode */
  }
  notifyStudioShellSync()
}

export function readSyncedStudioPersist(): boolean {
  if (typeof window === "undefined") return false
  try {
    const raw = localStorage.getItem(LS_PRISM_STUDIO_PERSIST)
    /* "1" is canonical; accept legacy truthy strings seen in older builds / dev data. */
    return raw === "1" || raw === "true"
  } catch {
    /* ignore */
  }
  return false
}

export function writeSyncedStudioPersist(persist: boolean): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(LS_PRISM_STUDIO_PERSIST, persist ? "1" : "0")
  } catch {
    /* ignore quota / private mode */
  }
  notifyStudioShellSync()
}
