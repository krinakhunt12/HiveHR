import React from 'react';
import { type LucideIcon, Inbox } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface EmptyStateProps {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  icon?: LucideIcon | React.ElementType;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No data available",
  description = "There's nothing to display at the moment.",
  action,
  className,
  icon: Icon = Inbox
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in-95 duration-500",
      className
    )}>
      <div className="relative group mb-6">
        <div className="absolute -inset-4 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />
        <div className="relative w-20 h-20 bg-background border border-primary/5 rounded-3xl flex items-center justify-center text-primary/40 shadow-sm group-hover:text-primary/60 transition-colors">
          <Icon size={32} strokeWidth={1.5} />
        </div>
      </div>
      <div className="space-y-2 max-w-sm mx-auto">
        <h3 className="text-lg font-bold text-textPrimary tracking-tight font-display">{title}</h3>
        <p className="text-sm font-semibold text-textSecondary leading-relaxed">
          {description}
        </p>
      </div>
      {action && (
        <div className="mt-8">
          {action}
        </div>
      )}
    </div>
  );
};
