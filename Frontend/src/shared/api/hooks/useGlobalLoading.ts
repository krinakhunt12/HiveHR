import { useIsFetching, useIsMutating } from '@tanstack/react-query';

/**
 * Custom hook to track global loading state across the application.
 * Useful for showing global progress bars or determining if the app is busy.
 */
export function useGlobalLoading() {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();

  const isLoading = isFetching > 0;
  const isPending = isMutating > 0;
  const isBusy = isLoading || isPending;

  return {
    isFetching: isFetching > 0,
    isMutating: isMutating > 0,
    isLoading,
    isPending,
    isBusy,
    count: {
      fetching: isFetching,
      mutating: isMutating,
    }
  };
}
