import * as React from "react"
import { cn } from "@/shared/utils/cn"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-2xl bg-muted/50", className)}
      {...props}
    />
  )
}

export { Skeleton }

