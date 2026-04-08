"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer relative flex h-8 w-16 justify-between shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-foreground",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block size-[1.75rem] rounded-full bg-background shadow-lg ring-0 transition-transform translate-x-0 data-[state=checked]:translate-x-8"
      )}
    />
    <span className="select-none text-[12px] font-bold uppercase leading-none tracking-tight flex-1 data-[state=checked]:text-background data-[state=unchecked]:text-background absolute transition-position left-8 data-[state=checked]:left-2" data-state={props.checked ? "checked" : "unchecked"}>
      {props.checked ? "on" : "off"}
    </span>
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
