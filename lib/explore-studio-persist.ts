/** Persisted Explore slice + studio snapshot (columns, gap, wave, corners). */
export const LS_EXPLORE_STUDIO = "prideguide-explore-studio-v1"

export type ExploreStudioSnapshot = {
  columnCount: number
  waveBoost: boolean
  stripeGap: number
  cornerRadius: number
}

function clampInt(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(n)))
}

export function randomExploreStudioSnapshot(): ExploreStudioSnapshot {
  return {
    columnCount: 10 + Math.floor(Math.random() * 23),
    waveBoost: Math.random() < 0.5,
    stripeGap: Math.floor(Math.random() * 17),
    cornerRadius: Math.floor(Math.random() * 29),
  }
}

export function parseExploreStudioSnapshot(raw: unknown): ExploreStudioSnapshot | null {
  if (!raw || typeof raw !== "object") return null
  const o = raw as Record<string, unknown>
  const columnCount =
    typeof o.columnCount === "number" ? clampInt(o.columnCount, 10, 32) : null
  const stripeGap = typeof o.stripeGap === "number" ? clampInt(o.stripeGap, 0, 16) : null
  const cornerRadius =
    typeof o.cornerRadius === "number" ? clampInt(o.cornerRadius, 0, 28) : null
  const waveBoost = typeof o.waveBoost === "boolean" ? o.waveBoost : null
  if (columnCount === null || stripeGap === null || cornerRadius === null || waveBoost === null) {
    return null
  }
  return { columnCount, waveBoost, stripeGap, cornerRadius }
}

export function readExploreStudioSnapshotFromStorage(): ExploreStudioSnapshot | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(LS_EXPLORE_STUDIO)
    const parsed = raw ? (JSON.parse(raw) as unknown) : null
    return parseExploreStudioSnapshot(parsed)
  } catch {
    return null
  }
}
