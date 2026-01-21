/**
 * API Configuration
 * Centralized API client setup with interceptors
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Get authentication token from localStorage
 */
export const getAuthToken = () => {
    try {
        const session = localStorage.getItem('supabase.auth.token');
        if (!session) return null;

        const parsedSession = JSON.parse(session);
        return parsedSession?.access_token || parsedSession?.session?.access_token;
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
};

/**
 * Set authentication token in localStorage
 */
export const setAuthToken = (session) => {
    try {
        localStorage.setItem('supabase.auth.token', JSON.stringify(session));
    } catch (error) {
        console.error('Error setting auth token:', error);
    }
};

/**
 * Remove authentication token from localStorage
 */
export const removeAuthToken = () => {
    try {
        localStorage.removeItem('supabase.auth.token');
    } catch (error) {
        console.error('Error removing auth token:', error);
    }
};

/**
 * API Error class
 */
export class APIError extends Error {
    constructor(message, statusCode, errors = null) {
        super(message);
        this.name = 'APIError';
        this.statusCode = statusCode;
        this.errors = errors;
    }
}

/**
 * Generic API call function with error handling
 */
export const apiCall = async (endpoint, options = {}) => {
    const token = getAuthToken();

    const config = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers
        }
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);

        // Parse response
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        // Handle non-2xx responses
        if (!response.ok) {
            const errorMessage = data?.error || data?.message || 'An error occurred';
            const errors = data?.errors || null;

            throw new APIError(errorMessage, response.status, errors);
        }

        return data;
    } catch (error) {
        // Network errors or other fetch errors
        if (error instanceof APIError) {
            throw error;
        }

        throw new APIError(
            error.message || 'Network error. Please check your connection.',
            0
        );
    }
};

/**
 * Helper function to build query string
 */
export const buildQueryString = (params) => {
    if (!params || Object.keys(params).length === 0) return '';

    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            query.append(key, value);
        }
    });

    const queryString = query.toString();
    return queryString ? `?${queryString}` : '';
};

export default apiCall;
