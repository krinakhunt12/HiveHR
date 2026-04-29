import { Skeleton, SkeletonAvatar } from '../skeleton';
import { cn } from '@/shared/utils/cn';

interface ListSkeletonProps {
  count?: number;
  className?: string;
}

export const ListSkeleton = ({ count = 6, className }: ListSkeletonProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className="p-5 rounded-2xl border border-primary/5 bg-white flex items-center justify-between shadow-sm group"
        >
          <div className="flex items-center gap-4">
            <SkeletonAvatar size="md" className="rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40 rounded-md" />
              <Skeleton className="h-3 w-24 rounded-md opacity-60" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-8 w-24 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
};
