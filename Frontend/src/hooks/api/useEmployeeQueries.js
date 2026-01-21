/**
 * Employee Query Hooks
 * TanStack Query hooks for employee management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeAPI } from '../../services/employeeService';
import { queryKeys } from '../../config/queryClient';
import { toast } from '../../utils/toast';

/**
 * Get all employees with filters
 */
export const useEmployees = (params = {}, options = {}) => {
    return useQuery({
        queryKey: queryKeys.employees.all(params),
        queryFn: () => employeeAPI.getAll(params),
        ...options
    });
};

/**
 * Get employee by ID
 */
export const useEmployee = (id, options = {}) => {
    return useQuery({
        queryKey: queryKeys.employees.detail(id),
        queryFn: () => employeeAPI.getById(id),
        enabled: !!id, // Only run if ID exists
        ...options
    });
};

/**
 * Get employee statistics
 */
export const useEmployeeStats = (id, options = {}) => {
    return useQuery({
        queryKey: queryKeys.employees.stats(id),
        queryFn: () => employeeAPI.getStats(id),
        enabled: !!id,
        ...options
    });
};

/**
 * Create employee mutation (Admin only)
 */
export const useCreateEmployee = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (employeeData) => employeeAPI.create(employeeData),
        onSuccess: (data) => {
            toast.success(`Employee ${data.data?.employee?.full_name} created successfully!`);

            // Invalidate employees list
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        }
    });
};

/**
 * Update employee mutation (HR/Admin)
 */
export const useUpdateEmployee = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, updates }) => employeeAPI.update(id, updates),
        onSuccess: (data, variables) => {
            toast.success('Employee updated successfully!');

            // Invalidate specific employee and list
            queryClient.invalidateQueries({ queryKey: queryKeys.employees.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        }
    });
};

/**
 * Delete employee mutation (Admin only)
 */
export const useDeleteEmployee = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => employeeAPI.delete(id),
        onSuccess: () => {
            toast.success('Employee deleted successfully!');

            // Invalidate employees list
            queryClient.invalidateQueries({ queryKey: ['employees'] });
        }
    });
};
