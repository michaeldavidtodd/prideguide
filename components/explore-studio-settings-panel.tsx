"use client"

import type { CSSProperties } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import type { StudioMotionPreference } from "@/lib/studio-shell-sync"

export type ExploreStudioMotionPreference = StudioMotionPreference

export type ExploreStudioSettingsPanelProps = {
  variant: "prism" | "explore"
  studioShellStyle: CSSProperties | undefined
  cornerRadius: number
  motionPreference: StudioMotionPreference
  onMotionPreferenceChange: (value: StudioMotionPreference) => void
  setCornerRadius: (n: number) => void
  studioPersist: boolean
  onStudioPersistChange: (persist: boolean) => void
  /** Explore only */
  columnCount?: number
  setColumnCount?: (n: number) => void
  stripeGap?: number
  setStripeGap?: (n: number) => void
  gifExporting?: boolean
  onDownloadGif?: () => void
}

/** Studio controls for the appearance dock: shared motion / corners / persist; Explore adds slice + export. */
export function ExploreStudioSettingsPanel(props: ExploreStudioSettingsPanelProps) {
  const {
    variant,
    studioShellStyle,
    cornerRadius,
    motionPreference,
    onMotionPreferenceChange,
    setCornerRadius,
    studioPersist,
    onStudioPersistChange,
    columnCount = 18,
    setColumnCount,
    stripeGap = 0,
    setStripeGap,
    gifExporting = false,
    onDownloadGif,
  } = props

  const exploreExtras =
    variant === "explore" && setColumnCount && setStripeGap && onDownloadGif
      ? { columnCount, setColumnCount, stripeGap, setStripeGap, gifExporting, onDownloadGif }
      : null

  const motionId = variant === "explore" ? "explore" : "prism"

  return (
    <div className="space-y-4 pb-1">
      <header className="space-y-1 pb-1">
        <p className="font-display text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary">
          Studio
        </p>
        <h2 className="font-display text-lg font-extrabold leading-tight tracking-tight text-foreground">
          Motion & layout
        </h2>
        <p className="text-sm leading-snug text-muted-foreground">
          {variant === "explore"
            ? "Fine-tune motion, slice layout, and frames."
            : "Fine-tune motion and rounded edges across Prism."}
        </p>
      </header>

      <div
        data-slot="motion"
        className={cn(
          "space-y-3 bg-foreground/5 p-4",
          cornerRadius > 0 && "rounded-lg",
        )}
        style={studioShellStyle}
      >
        <div>
          <Label className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Motion
          </Label>
          <p className="mt-1 text-xs leading-snug text-balance text-muted-foreground">
            Default follows your device. Override like the site theme.
          </p>
        </div>
        <RadioGroup
          value={motionPreference}
          onValueChange={(v) => onMotionPreferenceChange(v as StudioMotionPreference)}
          className="grid gap-2.5 pt-1 sm:grid-cols-3"
          aria-label="Reduce motion preference"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="system" id={`${motionId}-motion-system`} />
            <Label htmlFor={`${motionId}-motion-system`} className="cursor-pointer text-sm font-normal leading-none">
              System
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="reduce" id={`${motionId}-motion-reduce`} />
            <Label htmlFor={`${motionId}-motion-reduce`} className="cursor-pointer text-sm font-normal leading-none">
              Reduce
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="full" id={`${motionId}-motion-full`} />
            <Label htmlFor={`${motionId}-motion-full`} className="cursor-pointer text-sm font-normal leading-none">
              Full
            </Label>
          </div>
        </RadioGroup>
      </div>

      {exploreExtras ? (
        <>
          <div
            className={cn("space-y-2 bg-foreground/5 p-4", cornerRadius > 0 && "rounded-lg")}
            style={studioShellStyle}
          >
            <div className="flex items-center justify-between gap-3">
              <Label className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Slice resolution
              </Label>
              <span className="text-xs tabular-nums text-muted-foreground">{exploreExtras.columnCount} columns</span>
            </div>
            <Slider
              value={[exploreExtras.columnCount]}
              onValueChange={(v) => exploreExtras.setColumnCount(v[0] ?? 18)}
              min={10}
              max={32}
              step={1}
              aria-label="Adjust column count"
            />
          </div>

          <div
            className={cn("space-y-2 bg-foreground/5 p-4", cornerRadius > 0 && "rounded-lg")}
            style={studioShellStyle}
          >
            <div className="flex items-center justify-between gap-3">
              <Label className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Gap between stripes
              </Label>
              <span className="text-xs tabular-nums text-muted-foreground">{exploreExtras.stripeGap}px</span>
            </div>
            <Slider
              value={[exploreExtras.stripeGap]}
              onValueChange={(v) => exploreExtras.setStripeGap(v[0] ?? 0)}
              min={0}
              max={16}
              step={1}
              aria-label="Gap between stripes"
            />
          </div>
        </>
      ) : null}

      <div
        className={cn("space-y-2 bg-foreground/5 p-4", cornerRadius > 0 && "rounded-lg")}
        style={studioShellStyle}
      >
        <div className="flex items-center justify-between gap-3">
          <Label className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Rounded edges
          </Label>
          <span className="text-xs tabular-nums text-muted-foreground">{cornerRadius}px</span>
        </div>
        <Slider
          value={[cornerRadius]}
          onValueChange={(v) => setCornerRadius(v[0] ?? 0)}
          min={0}
          max={28}
          step={1}
          aria-label="Border radius"
        />
      </div>

      <div
        className={cn("flex flex-row justify-between gap-3 bg-foreground/5 p-4", cornerRadius > 0 && "rounded-lg")}
        style={studioShellStyle}
      >
        <div className="min-w-0 space-y-0.5">
          <Label
            htmlFor={`studio-persist-${motionId}`}
            className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground"
          >
            Save studio settings
          </Label>
          <p className="text-xs leading-snug text-balance text-muted-foreground">
            {studioPersist
              ? "Motion, rounded edges, and Explore slice layout stay as you left them."
              : "Explore randomizes stripe layout on each visit; motion and edges still update as you adjust them."}
          </p>
        </div>
        <Switch
          id={`studio-persist-${motionId}`}
          checked={studioPersist}
          onCheckedChange={onStudioPersistChange}
        />
      </div>

      {exploreExtras ? (
        <div
          className={cn("max-md:hidden space-y-2 bg-foreground/5 p-4", cornerRadius > 0 && "rounded-lg")}
          style={studioShellStyle}
        >
          <Label className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Export
          </Label>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "w-full gap-2 font-display text-xs font-bold uppercase tracking-wide",
              cornerRadius <= 0 && "rounded-none",
            )}
            style={studioShellStyle}
            disabled={exploreExtras.gifExporting}
            onClick={() => void exploreExtras.onDownloadGif()}
          >
            <Download className="size-4 shrink-0 opacity-80" aria-hidden />
            {exploreExtras.gifExporting ? "Encoding…" : "Download GIF"}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
