import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { cn } from '@/shared/utils/cn';
import { Button } from './button';
import { Card, CardContent } from './card';

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
    <Card className={cn("max-w-md mx-auto overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700", className)}>
      <CardContent className="flex flex-col items-center justify-center p-8 md:p-12 text-center">
        <div className="relative group mb-6">
          <div className="absolute -inset-4 bg-error/5 rounded-full blur-2xl group-hover:bg-error/10 transition-colors duration-500" />
          <div className="relative w-16 h-16 bg-background border border-error/10 rounded-2xl flex items-center justify-center text-error shadow-sm hover:scale-105 transition-transform">
            <AlertCircle size={28} strokeWidth={2} />
          </div>
        </div>
        <div className="space-y-4 w-full">
          <h3 className="text-xl font-bold text-textPrimary tracking-tight">{title}</h3>
          <p className="text-sm font-medium text-textSecondary leading-relaxed">
            {description}
          </p>
          
          {errorMessage && (
            <div className="mt-4 p-4 rounded-xl bg-error/5 border border-error/10 text-xs font-bold text-error/80 font-mono break-words text-left">
              {errorMessage}
            </div>
          )}

          {onRetry && (
            <div className="pt-6">
              <Button 
                onClick={onRetry} 
                variant="default"
                size="lg"
                className="w-full sm:w-auto h-11 px-8 rounded-xl font-semibold"
              >
                <RefreshCcw size={16} className="mr-2" /> Retry Connection
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
