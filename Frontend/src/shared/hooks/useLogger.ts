import { useCallback } from 'react';

export function useLogger() {
  const logError = useCallback((error: Error, info?: any) => {
    // In development, log to console
    if (import.meta.env.DEV) {
      console.error('Logged Error:', error);
      if (info) console.error('Error Info:', info);
    }

    // This is where you would integrate Sentry or other logging services
    // Example: Sentry.captureException(error, { extra: info });
  }, []);

  const logInfo = useCallback((message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.log('Log:', message, data);
    }
  }, []);

  return { logError, logInfo };
}
