"use client"

import { useEffect, useState } from "react"
import {
  readExploreStudioSnapshotFromStorage,
  type ExploreStudioSnapshot,
} from "@/lib/explore-studio-persist"
import { readSyncedStudioPersist, STUDIO_SHELL_SYNC_EVENT } from "@/lib/studio-shell-sync"

/**
 * When “Save studio settings” is on, returns the persisted Explore slice (columns, gap, wave)
 * so other pages can match the main explorer flag. Otherwise null (caller uses page defaults).
 */
export function usePersistedExploreFlagSlice(): ExploreStudioSnapshot | null {
  const [slice, setSlice] = useState<ExploreStudioSnapshot | null>(null)

  useEffect(() => {
    const read = () => {
      if (!readSyncedStudioPersist()) {
        setSlice(null)
        return
      }
      setSlice(readExploreStudioSnapshotFromStorage())
    }
    read()
    window.addEventListener(STUDIO_SHELL_SYNC_EVENT, read)
    window.addEventListener("storage", read)
    return () => {
      window.removeEventListener(STUDIO_SHELL_SYNC_EVENT, read)
      window.removeEventListener("storage", read)
    }
  }, [])

  return slice
}
