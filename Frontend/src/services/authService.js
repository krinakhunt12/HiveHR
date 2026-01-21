/**
 * Authentication API Service
 * All authentication-related API calls
 */

import { apiCall, setAuthToken, removeAuthToken } from './apiConfig';

export const authAPI = {
    /**
     * Login user
     */
    login: async (email, password) => {
        const data = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        // Store session
        if (data.data?.session) {
            setAuthToken(data.data.session);
        }

        return data;
    },

    /**
     * Register new user (Admin only)
     */
    register: async (userData) => {
        return await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    },

    /**
     * Logout user
     */
    logout: async () => {
        const data = await apiCall('/auth/logout', {
            method: 'POST'
        });

        // Remove session
        removeAuthToken();

        return data;
    },

    /**
     * Get current user
     */
    getCurrentUser: async () => {
        return await apiCall('/auth/me');
    },

    /**
     * Refresh token
     */
    refreshToken: async (refreshToken) => {
        const data = await apiCall('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refresh_token: refreshToken })
        });

        // Update session
        if (data.data?.session) {
            setAuthToken(data.data.session);
        }

        return data;
    },

    /**
     * Change password
     */
    changePassword: async (currentPassword, newPassword) => {
        return await apiCall('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            })
        });
    }
};

export default authAPI;
