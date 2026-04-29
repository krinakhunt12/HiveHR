import { Skeleton, SkeletonButton } from '../skeleton';
import { cn } from '@/shared/utils/cn';

interface FormSkeletonProps {
  fields?: number;
  className?: string;
}

export const FormSkeleton = ({ fields = 4, className }: FormSkeletonProps) => {
  return (
    <div className={cn("space-y-8 p-8 rounded-[2rem] border border-primary/5 bg-white shadow-sm", className)}>
      <div className="space-y-6">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-4 pt-6 border-t border-primary/5">
        <SkeletonButton className="w-24 h-11 rounded-xl opacity-60" />
        <SkeletonButton className="w-32 h-11 rounded-xl" />
      </div>
    </div>
  );
};
