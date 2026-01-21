/**
 * Authentication Query Hooks
 * TanStack Query hooks for authentication
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/authService';
import { queryKeys } from '../../config/queryClient';
import { toast } from '../../utils/toast';

/**
 * Get current user
 */
export const useCurrentUser = (options = {}) => {
    return useQuery({
        queryKey: queryKeys.auth.currentUser,
        queryFn: authAPI.getCurrentUser,
        ...options
    });
};

/**
 * Login mutation
 */
export const useLogin = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ email, password }) => authAPI.login(email, password),
        onSuccess: (data) => {
            toast.success('Login successful!');

            // Set current user in cache
            queryClient.setQueryData(queryKeys.auth.currentUser, data);

            // Navigate based on role
            const role = data.data?.profile?.role;
            if (role === 'admin') {
                navigate('/admin/dashboard');
            } else if (role === 'hr') {
                navigate('/hr/dashboard');
            } else {
                navigate('/employee/dashboard');
            }
        },
        onError: (error) => {
            // Error is handled globally, but we can add specific handling here
            console.error('Login error:', error);
        }
    });
};

/**
 * Register mutation (Admin only)
 */
export const useRegister = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userData) => authAPI.register(userData),
        onSuccess: (data) => {
            toast.success(`User ${data.data?.profile?.full_name} created successfully!`);

            // Invalidate employees list
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        }
    });
};

/**
 * Logout mutation
 */
export const useLogout = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: authAPI.logout,
        onSuccess: () => {
            toast.success('Logged out successfully');

            // Clear all queries
            queryClient.clear();

            // Navigate to login
            navigate('/login');
        }
    });
};

/**
 * Change password mutation
 */
export const useChangePassword = () => {
    return useMutation({
        mutationFn: ({ currentPassword, newPassword }) =>
            authAPI.changePassword(currentPassword, newPassword),
        onSuccess: () => {
            toast.success('Password changed successfully!');
        }
    });
};

/**
 * Refresh token mutation
 */
export const useRefreshToken = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (refreshToken) => authAPI.refreshToken(refreshToken),
        onSuccess: (data) => {
            // Update current user in cache
            queryClient.setQueryData(queryKeys.auth.currentUser, data);
        }
    });
};
