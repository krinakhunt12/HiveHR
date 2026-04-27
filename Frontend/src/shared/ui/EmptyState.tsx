import React from 'react';
import { type LucideIcon, Inbox } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Card, CardContent } from './card';

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
    <Card className={cn("max-w-md mx-auto border-dashed animate-in fade-in zoom-in-95 duration-500", className)}>
      <CardContent className="flex flex-col items-center justify-center p-12 text-center">
        <div className="relative group mb-6">
          <div className="absolute -inset-4 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500" />
          <div className="relative w-16 h-16 bg-background border border-border rounded-2xl flex items-center justify-center text-textSecondary shadow-sm group-hover:text-primary transition-colors">
            <Icon size={28} strokeWidth={1.5} />
          </div>
        </div>
        <div className="space-y-2 w-full">
          <h3 className="text-lg font-bold text-textPrimary tracking-tight">{title}</h3>
          <p className="text-sm font-medium text-textSecondary leading-relaxed">
            {description}
          </p>
        </div>
        {action && (
          <div className="mt-8">
            {action}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
