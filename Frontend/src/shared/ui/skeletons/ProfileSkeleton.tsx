import { Skeleton, SkeletonAvatar, SkeletonText } from '../skeleton';
import { cn } from '@/shared/utils/cn';

interface ProfileSkeletonProps {
  className?: string;
}

export const ProfileSkeleton = ({ className }: ProfileSkeletonProps) => {
  return (
    <div className={cn("p-10 rounded-[2.5rem] border border-primary/5 bg-white shadow-sm space-y-10", className)}>
      <div className="flex flex-col md:flex-row items-center gap-8">
        <SkeletonAvatar size="xl" />
        <div className="space-y-4 text-center md:text-left flex-1">
          <Skeleton className="h-10 w-64 rounded-xl mx-auto md:mx-0" />
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-full" />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-6 border-t border-primary/5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-3 w-20 rounded-md opacity-60" />
            <Skeleton className="h-5 w-40 rounded-lg" />
          </div>
        ))}
      </div>

      <div className="space-y-4 pt-6">
        <Skeleton className="h-6 w-48 rounded-lg" />
        <SkeletonText lines={4} />
      </div>
    </div>
  );
};
