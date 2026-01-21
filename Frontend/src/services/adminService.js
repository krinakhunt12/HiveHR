/**
 * Admin API Service
 */
import { apiCall } from './apiConfig';

export const adminAPI = {
    /**
     * Get aggregate stats for Admin dashboard
     */
    getStats: async () => {
        return await apiCall('/admin/stats');
    },

    /**
     * Update user status (Admin only)
     */
    updateUserStatus: async (userId, status) => {
        return await apiCall(`/employees/${userId}`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    },

    /**
     * Delete user (Admin only)
     */
    deleteUser: async (userId) => {
        return await apiCall(`/employees/${userId}`, {
            method: 'DELETE'
        });
    }
};

export default adminAPI;
