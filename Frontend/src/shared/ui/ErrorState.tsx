import React from 'react';
import {  AlertCircle, RefreshCcw } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Button } from './button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  error?: Error | string | null;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "System Anomaly",
  description = "Something went wrong while processing your request.",
  error,
  onRetry,
  className
}) => {
  const errorMessage = typeof error === 'string' ? error : error?.message;

  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-12 text-center animate-in fade-in slide-in-from-bottom-2 duration-500",
      className
    )}>
      <div className="relative group mb-6">
        <div className="absolute -inset-4 bg-error/5 rounded-full blur-2xl group-hover:bg-error/10 transition-colors duration-500" />
        <div className="relative w-20 h-20 bg-background border border-error/10 rounded-3xl flex items-center justify-center text-error shadow-sm hover:scale-105 transition-transform">
          <AlertCircle size={32} strokeWidth={2} />
        </div>
      </div>
      <div className="space-y-4 max-w-sm mx-auto">
        <h3 className="text-xl font-bold text-textPrimary tracking-tight font-display">{title}</h3>
        <p className="text-sm font-semibold text-textSecondary opacity-60 leading-relaxed">
          {description}
        </p>
        
        {errorMessage && (
          <div className="mt-4 p-4 rounded-xl bg-error/5 border border-error/5 text-xs font-bold text-error/80 font-mono break-words">
            {errorMessage}
          </div>
        )}

        {onRetry && (
          <div className="pt-6">
            <Button 
                onClick={onRetry} 
                variant="outline"
                className="font-bold text-xs uppercase tracking-widest border-primary/10 hover:bg-primary/5 h-11 px-8 rounded-xl"
            >
              <RefreshCcw size={14} className="mr-2" /> Attempt Reconnect
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
