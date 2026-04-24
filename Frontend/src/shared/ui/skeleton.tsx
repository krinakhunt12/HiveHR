import * as React from "react"
import { cn } from "@/shared/utils/cn"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-2xl bg-slate-200/50 dark:bg-slate-800/50", className)}
      {...props}
    />
  )
}

function SkeletonText({ lines = 1, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={cn(
            "h-4 w-full rounded-md",
            i === lines - 1 && lines > 1 ? "w-2/3" : ""
          )} 
        />
      ))}
    </div>
  )
}

function SkeletonAvatar({ size = "md", className }: { size?: "sm" | "md" | "lg" | "xl"; className?: string }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
    xl: "h-24 w-24",
  }
  return <Skeleton className={cn(sizeClasses[size], "rounded-full", className)} />
}

function SkeletonButton({ className }: { className?: string }) {
  return <Skeleton className={cn("h-10 w-28 rounded-xl", className)} />
}

function SkeletonCard({ className, hasHeader = true, lines = 3 }: { className?: string; hasHeader?: boolean; lines?: number }) {
  return (
    <div className={cn("card-premium p-6 border border-border bg-surface space-y-4", className)}>
      {hasHeader && (
        <div className="flex items-center gap-3">
          <SkeletonAvatar size="sm" />
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>
      )}
      <SkeletonText lines={lines} />
      <div className="flex justify-end pt-2">
        <SkeletonButton className="w-20 h-8" />
      </div>
    </div>
  )
}

function SkeletonTable({ rows = 5, columns = 4, className }: { rows?: number; columns?: number; className?: string }) {
  return (
    <div className={cn("w-full overflow-hidden rounded-[2rem] border border-border bg-surface", className)}>
      <div className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-border px-8 py-4 flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1 rounded-md" />
        ))}
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-8 py-6 flex gap-4 items-center">
            {Array.from({ length: columns }).map((_, j) => (
              <div key={j} className="flex-1">
                {j === 0 ? (
                  <div className="flex items-center gap-3">
                    <SkeletonAvatar size="sm" className="h-8 w-8" />
                    <Skeleton className="h-3 w-20 rounded-md" />
                  </div>
                ) : (
                  <Skeleton className="h-3 w-16 rounded-md" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export { 
  Skeleton, 
  SkeletonText, 
  SkeletonAvatar, 
  SkeletonButton, 
  SkeletonCard, 
  SkeletonTable 
}

