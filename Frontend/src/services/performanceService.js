/**
 * Performance API Service
 */
import { apiCall } from './apiConfig';

export const performanceAPI = {
    /**
     * Get current user's performance reviews
     */
    getMyReviews: async () => {
        return await apiCall('/performance/my-reviews');
    },

    /**
     * Get team members' performance reviews (Manager/HR/Admin)
     */
    getTeamReviews: async () => {
        return await apiCall('/performance/team-reviews');
    },

    /**
     * Create a performance review
     */
    createReview: async (reviewData) => {
        return await apiCall('/performance', {
            method: 'POST',
            body: JSON.stringify(reviewData)
        });
    }
};

export default performanceAPI;
