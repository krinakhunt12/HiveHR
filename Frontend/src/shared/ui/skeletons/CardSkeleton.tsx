
import { Skeleton, SkeletonText, SkeletonButton, SkeletonAvatar } from '../skeleton';
import { cn } from '@/shared/utils/cn';

interface CardSkeletonProps {
  count?: number;
  className?: string;
  hasHeader?: boolean;
}

export const CardSkeleton = ({ count = 1, className, hasHeader = true }: CardSkeletonProps) => {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className={cn(
            "p-6 rounded-[2rem] border border-primary/5 bg-white space-y-6 shadow-sm", 
            className
          )}
        >
          {hasHeader && (
            <div className="flex items-center gap-4">
              <SkeletonAvatar size="sm" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-3 w-20 rounded-md opacity-60" />
              </div>
            </div>
          )}
          
          <Skeleton className="aspect-video w-full rounded-2xl" />
          
          <div className="space-y-3">
            <Skeleton className="h-5 w-2/3 rounded-lg" />
            <SkeletonText lines={2} className="opacity-70" />
          </div>

          <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-4 w-24 rounded-md" />
            <SkeletonButton className="w-24 h-9 rounded-xl" />
          </div>
        </div>
      ))}
    </>
  );
};
