/**
 * HR API Service
 */
import { apiCall } from './apiConfig';

export const hrAPI = {
    /**
     * Get aggregate stats for HR dashboard
     */
    getStats: async () => {
        return await apiCall('/hr/stats');
    },

    /**
     * Get people for HR (employees in company)
     */
    getPeople: async (params = {}) => {
        // Re-use employee service but specifically for HR view if needed
        // Or implement specific HR people endpoint
        return await apiCall('/employees');
    }
};

export default hrAPI;
