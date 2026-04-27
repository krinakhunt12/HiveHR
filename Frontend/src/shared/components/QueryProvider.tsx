import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query';
import { useToast } from '@/shared/ui/toast';
import { type ReactNode, useMemo } from 'react';
import { ApiError } from '@/shared/api/baseApi';

interface Props {
  children: ReactNode;
}

export function QueryProvider({ children }: Props) {
  const toast = useToast();

  const queryClient = useMemo(() => new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        // Only show toast for unexpected errors, or specific ones
        // Many queries might fail silently or handle errors locally
        if (error instanceof ApiError) {
          if (error.statusCode >= 500) {
            toast({
              title: 'Server Error',
              description: error.message || 'Something went wrong on our end.',
              type: 'error',
            });
          }
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error) => {
        if (error instanceof ApiError) {
          toast({
            title: 'Action Failed',
            description: error.message || 'We could not complete this action.',
            type: 'error',
          });
        } else {
          toast({
            title: 'Unexpected Error',
            description: 'A runtime error occurred.',
            type: 'error',
          });
        }
      },
    }),
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
    },
  }), [toast]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
