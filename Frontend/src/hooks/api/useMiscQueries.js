/**
 * Misc Query Hooks
 */
import { useQuery } from '@tanstack/react-query';
import { miscAPI } from '../../services/miscService';

/**
 * Hook to get landing page data
 */
export const useLandingPageData = (options = {}) => {
    return useQuery({
        queryKey: ['misc', 'landing-page'],
        queryFn: miscAPI.getLandingPageData,
        staleTime: 24 * 60 * 60 * 1000, // 24 hours
        ...options
    });
};

/**
 * Hook to get app configuration
 */
export const useAppConfig = (options = {}) => {
    return useQuery({
        queryKey: ['misc', 'config'],
        queryFn: miscAPI.getAppConfig,
        staleTime: 60 * 60 * 1000, // 1 hour
        ...options
    });
};

/**
 * Hook to get holidays
 */
export const useHolidays = (options = {}) => {
    return useQuery({
        queryKey: ['misc', 'holidays'],
        queryFn: miscAPI.getHolidays,
        staleTime: 24 * 60 * 60 * 1000, // 24 hours
        ...options
    });
};
