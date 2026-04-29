import { Skeleton, SkeletonAvatar } from '../skeleton';
import { cn } from '@/shared/utils/cn';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const TableSkeleton = ({ rows = 5, columns = 4, className }: TableSkeletonProps) => {
  return (
    <div className={cn("w-full overflow-hidden rounded-[2rem] border border-primary/5 bg-white shadow-sm", className)}>
      <div className="bg-primary/[0.02] border-b border-primary/5 px-8 py-5 flex gap-6">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1 rounded-md opacity-60" />
        ))}
      </div>
      <div className="divide-y divide-primary/5">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="px-8 py-6 flex gap-6 items-center">
            {Array.from({ length: columns }).map((_, j) => (
              <div key={j} className="flex-1">
                {j === 0 ? (
                  <div className="flex items-center gap-4">
                    <SkeletonAvatar size="sm" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3.5 w-24 rounded-md" />
                      <Skeleton className="h-2.5 w-16 rounded-md opacity-50" />
                    </div>
                  </div>
                ) : (
                  <Skeleton className="h-3 w-20 rounded-md" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
