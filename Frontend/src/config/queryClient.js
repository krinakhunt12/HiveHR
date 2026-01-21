/**
 * React Query Configuration
 * QueryClient setup with default options
 */

import { QueryClient } from '@tanstack/react-query';
import { toast } from './utils/toast';
import { APIError } from './services/apiConfig';

/**
 * Default query options
 */
const defaultQueryOptions = {
    queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        cacheTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: (failureCount, error) => {
            // Don't retry on 4xx errors
            if (error instanceof APIError && error.statusCode >= 400 && error.statusCode < 500) {
                return false;
            }
            // Retry up to 2 times for other errors
            return failureCount < 2;
        },
        onError: (error) => {
            handleQueryError(error);
        }
    },
    mutations: {
        retry: false,
        onError: (error) => {
            handleMutationError(error);
        }
    }
};

/**
 * Handle query errors globally
 */
const handleQueryError = (error) => {
    if (error instanceof APIError) {
        // Handle specific status codes
        switch (error.statusCode) {
            case 401:
                // Unauthorized - redirect to login
                toast.error('Session expired. Please login again.');
                // Clear auth token
                localStorage.removeItem('supabase.auth.token');
                // Redirect to login after a short delay
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1500);
                break;

            case 403:
                toast.error('You do not have permission to access this resource.');
                break;

            case 404:
                toast.error('Resource not found.');
                break;

            case 500:
            case 502:
            case 503:
                toast.error('Server error. Please try again later.');
                break;

            default:
                // Show the error message from the API
                if (error.message && error.message !== 'An error occurred') {
                    toast.error(error.message);
                }
        }
    } else {
        // Network or other errors
        toast.error('Network error. Please check your connection.');
    }
};

/**
 * Handle mutation errors globally
 */
const handleMutationError = (error) => {
    if (error instanceof APIError) {
        // Handle specific status codes
        switch (error.statusCode) {
            case 400:
                // Validation errors
                if (error.errors && Array.isArray(error.errors)) {
                    // Show first validation error
                    const firstError = error.errors[0];
                    toast.error(firstError.message || error.message);
                } else {
                    toast.error(error.message || 'Invalid request. Please check your input.');
                }
                break;

            case 401:
                toast.error('Session expired. Please login again.');
                localStorage.removeItem('supabase.auth.token');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1500);
                break;

            case 403:
                toast.error('You do not have permission to perform this action.');
                break;

            case 404:
                toast.error('Resource not found.');
                break;

            case 409:
                toast.error(error.message || 'This resource already exists.');
                break;

            case 422:
                // Unprocessable entity - validation errors
                if (error.errors && Array.isArray(error.errors)) {
                    error.errors.forEach(err => {
                        toast.error(`${err.field}: ${err.message}`);
                    });
                } else {
                    toast.error(error.message || 'Validation error.');
                }
                break;

            case 500:
            case 502:
            case 503:
                toast.error('Server error. Please try again later.');
                break;

            default:
                toast.error(error.message || 'An error occurred. Please try again.');
        }
    } else {
        toast.error('Network error. Please check your connection.');
    }
};

/**
 * Create QueryClient instance
 */
export const queryClient = new QueryClient({
    defaultOptions: defaultQueryOptions
});

/**
 * Query keys factory
 */
export const queryKeys = {
    // Auth
    auth: {
        currentUser: ['auth', 'currentUser']
    },

    // Employees
    employees: {
        all: (params) => ['employees', 'all', params],
        detail: (id) => ['employees', 'detail', id],
        stats: (id) => ['employees', 'stats', id]
    },

    // Attendance
    attendance: {
        my: (params) => ['attendance', 'my', params],
        today: ['attendance', 'today'],
        employee: (userId, params) => ['attendance', 'employee', userId, params],
        all: (params) => ['attendance', 'all', params],
        stats: (params) => ['attendance', 'stats', params]
    },

    // Leaves
    leaves: {
        my: (params) => ['leaves', 'my', params],
        balance: (year) => ['leaves', 'balance', year],
        all: (params) => ['leaves', 'all', params]
    }
};

export default queryClient;
