import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../services/adminService';
import { employeeAPI } from '../../services/employeeService';
import { toast } from '../../utils/toast';

/**
 * Hook to get Admin dashboard stats
 */
export const useAdminStats = (options = {}) => {
    return useQuery({
        queryKey: ['admin', 'stats'],
        queryFn: async () => {
            const response = await adminAPI.getStats();
            return response.data;
        },
        ...options
    });
};

/**
 * Hook to get users by role
 */
export const useUsersByRole = (role, options = {}) => {
    return useQuery({
        queryKey: ['admin', 'users', role],
        queryFn: async () => {
            const response = await employeeAPI.getAll({ role });
            return response.data?.employees || [];
        },
        ...options
    });
};

/**
 * Hook to toggle user status
 */
export const useToggleUserStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, currentStatus }) => {
            const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
            return adminAPI.updateUserStatus(userId, newStatus);
        },
        onSuccess: () => {
            toast.success('User status updated');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        }
    });
};

/**
 * Hook to onboard/create user
 */
export const useOnboardUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userData) => employeeAPI.create(userData),
        onSuccess: () => {
            toast.success('User onboarded successfully');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        }
    });
};

/**
 * Hook to delete user
 */
export const useDeleteUser = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId) => adminAPI.deleteUser(userId),
        onSuccess: () => {
            toast.success('User deleted successfully');
            queryClient.invalidateQueries({ queryKey: ['admin'] });
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        }
    });
};
