/**
 * Leave Query Hooks
 * TanStack Query hooks for leave management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveAPI } from '../../services/leaveService';
import { queryKeys } from '../../config/queryClient';
import { toast } from '../../utils/toast';

/**
 * Get my leave requests
 */
export const useMyLeaves = (params = {}, options = {}) => {
    return useQuery({
        queryKey: queryKeys.leaves.my(params),
        queryFn: () => leaveAPI.getMyLeaves(params),
        ...options
    });
};

/**
 * Get leave balance
 */
export const useLeaveBalance = (year = null, options = {}) => {
    return useQuery({
        queryKey: queryKeys.leaves.balance(year),
        queryFn: () => leaveAPI.getBalance(year),
        ...options
    });
};

/**
 * Get all leave requests (HR/Admin)
 */
export const useAllLeaves = (params = {}, options = {}) => {
    return useQuery({
        queryKey: queryKeys.leaves.all(params),
        queryFn: () => leaveAPI.getAll(params),
        ...options
    });
};

/**
 * Create leave request mutation
 */
export const useCreateLeave = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (leaveData) => leaveAPI.create(leaveData),
        onSuccess: () => {
            toast.success('Leave request submitted successfully!');

            // Invalidate leave queries
            queryClient.invalidateQueries({ queryKey: ['leaves', 'my'] });
            queryClient.invalidateQueries({ queryKey: ['leaves', 'balance'] });
        }
    });
};

/**
 * Approve leave mutation (HR/Admin)
 */
export const useApproveLeave = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => leaveAPI.approve(id),
        onSuccess: () => {
            toast.success('Leave request approved successfully!');

            // Invalidate all leave queries
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
        }
    });
};

/**
 * Reject leave mutation (HR/Admin)
 */
export const useRejectLeave = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }) => leaveAPI.reject(id, reason),
        onSuccess: () => {
            toast.success('Leave request rejected');

            // Invalidate all leave queries
            queryClient.invalidateQueries({ queryKey: ['leaves'] });
        }
    });
};

/**
 * Cancel leave mutation
 */
export const useCancelLeave = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => leaveAPI.cancel(id),
        onSuccess: () => {
            toast.success('Leave request cancelled successfully!');

            // Invalidate leave queries
            queryClient.invalidateQueries({ queryKey: ['leaves', 'my'] });
            queryClient.invalidateQueries({ queryKey: ['leaves', 'balance'] });
        }
    });
};
