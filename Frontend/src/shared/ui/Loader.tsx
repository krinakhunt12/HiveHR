import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  center?: boolean;
}

const Loader: React.FC<LoaderProps> = ({ 
  size = 'md', 
  className,
  center = false 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  const loader = (
    <Loader2 
      className={cn(
        'animate-spin text-primary', 
        sizeClasses[size], 
        className
      )} 
    />
  );

  if (center) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[100px]">
        {loader}
      </div>
    );
  }

  return loader;
};

export const FullPageLoader = () => (
  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-300">
    <div className="flex flex-col items-center gap-4">
      <Loader size="lg" />
      <p className="text-sm font-bold text-textSecondary animate-pulse">Syncing HiveHR...</p>
    </div>
  </div>
);

export const InlineLoader = ({ text = "Loading...", className }: { text?: string, className?: string }) => (
  <div className={cn("flex items-center gap-2 text-textSecondary", className)}>
    <Loader size="sm" />
    <span className="text-sm font-medium">{text}</span>
  </div>
);

export { Loader };
