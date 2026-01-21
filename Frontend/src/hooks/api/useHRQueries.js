import { useQuery } from '@tanstack/react-query';
import { hrAPI } from '../../services/hrService';
import { employeeAPI } from '../../services/employeeService';

/**
 * Hook to get HR dashboard stats
 */
export const useHRStats = (options = {}) => {
    return useQuery({
        queryKey: ['hr', 'stats'],
        queryFn: async () => {
            const response = await hrAPI.getStats();
            return response.data;
        },
        ...options
    });
};

/**
 * Hook to get all employees for the company
 */
export const usePeople = (params = {}, options = {}) => {
    return useQuery({
        queryKey: ['hr', 'people', params],
        queryFn: async () => {
            const response = await employeeAPI.getAll(params);
            return response.data?.employees || [];
        },
        ...options
    });
};
