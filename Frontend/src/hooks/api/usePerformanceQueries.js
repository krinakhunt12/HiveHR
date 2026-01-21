/**
 * Performance Query Hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { performanceAPI } from '../../services/performanceService';
import { toast } from '../../utils/toast';

/**
 * Hook to get current user's performance reviews
 */
export const useMyReviews = (options = {}) => {
    return useQuery({
        queryKey: ['performance', 'my-reviews'],
        queryFn: async () => {
            const response = await performanceAPI.getMyReviews();
            return response.data;
        },
        ...options
    });
};

/**
 * Hook to get team member's performance reviews (Manager/HR/Admin)
 */
export const useTeamReviews = (options = {}) => {
    return useQuery({
        queryKey: ['performance', 'team-reviews'],
        queryFn: async () => {
            const response = await performanceAPI.getTeamReviews();
            return response.data;
        },
        ...options
    });
};

/**
 * Hook to create a performance review
 */
export const useCreateReview = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (reviewData) => performanceAPI.createReview(reviewData),
        onSuccess: () => {
            toast.success('Performance review logged successfully');
            queryClient.invalidateQueries({ queryKey: ['performance', 'team-reviews'] });
        },
        onError: (error) => {
            toast.error(error.message || 'Failed to log performance review');
        }
    });
};
