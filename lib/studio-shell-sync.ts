/** Cross-page sync for Explore “rounded edges” (studio corner radius). */
export const LS_STUDIO_CORNER_SYNC = "prideguide-studio-corner-v1"

export const STUDIO_SHELL_SYNC_EVENT = "prideguide:studio-shell-sync"

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
