/**
 * Toast Utility
 * Wrapper around your toast implementation
 */

// Import your toast implementation
// Adjust this import based on your actual toast setup
// If using @radix-ui/react-toast, you'll need to set up the provider first

let toastFunction = null;

/**
 * Initialize toast function
 * Call this from your toast provider/context
 */
export const initToast = (toastFn) => {
    toastFunction = toastFn;
};

/**
 * Toast helper functions
 */
export const toast = {
    success: (message, options = {}) => {
        if (toastFunction) {
            toastFunction({
                title: 'Success',
                description: message,
                variant: 'success',
                ...options
            });
        } else {
            // Fallback to console if toast not initialized
            console.log('✅ Success:', message);
        }
    },

    error: (message, options = {}) => {
        if (toastFunction) {
            toastFunction({
                title: 'Error',
                description: message,
                variant: 'destructive',
                ...options
            });
        } else {
            // Fallback to console if toast not initialized
            console.error('❌ Error:', message);
        }
    },

    info: (message, options = {}) => {
        if (toastFunction) {
            toastFunction({
                title: 'Info',
                description: message,
                variant: 'default',
                ...options
            });
        } else {
            // Fallback to console if toast not initialized
            console.info('ℹ️ Info:', message);
        }
    },

    warning: (message, options = {}) => {
        if (toastFunction) {
            toastFunction({
                title: 'Warning',
                description: message,
                variant: 'warning',
                ...options
            });
        } else {
            // Fallback to console if toast not initialized
            console.warn('⚠️ Warning:', message);
        }
    },

    loading: (message, options = {}) => {
        if (toastFunction) {
            toastFunction({
                title: 'Loading',
                description: message,
                variant: 'default',
                duration: Infinity, // Don't auto-dismiss
                ...options
            });
        } else {
            // Fallback to console if toast not initialized
            console.log('⏳ Loading:', message);
        }
    }
};

export default toast;
