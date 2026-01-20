/**
 * AppLogger - Centralized logging utility for HiveHR
 * Supports info, warning, and error levels.
 */

const IS_DEV = import.meta.env.DEV;

export const AppLogger = {
    info: (message, data = null) => {
        if (IS_DEV) {
            console.info(`[INFO] [${new Date().toLocaleTimeString()}] ${message}`, data || '');
        }
    },
    warn: (message, data = null) => {
        if (IS_DEV) {
            console.warn(`[WARN] [${new Date().toLocaleTimeString()}] ${message}`, data || '');
        }
    },
    error: (message, error = null) => {
        // Errors are logged even in production (optionally could be sent to Sentry)
        console.error(`[ERROR] [${new Date().toLocaleTimeString()}] ${message}`, error || '');
    },
    debug: (message, data = null) => {
        if (IS_DEV) {
            console.debug(`[DEBUG] [${new Date().toLocaleTimeString()}] ${message}`, data || '');
        }
    }
};

export default AppLogger;
