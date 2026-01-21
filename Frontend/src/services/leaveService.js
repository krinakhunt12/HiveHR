/**
 * Leave API Service
 * All leave-related API calls
 */

import { apiCall, buildQueryString } from './apiConfig';

export const leaveAPI = {
    /**
     * Create leave request
     */
    create: async (leaveData) => {
        return await apiCall('/leaves', {
            method: 'POST',
            body: JSON.stringify(leaveData)
        });
    },

    /**
     * Get my leave requests
     */
    getMyLeaves: async (params = {}) => {
        const queryString = buildQueryString(params);
        return await apiCall(`/leaves/my-leaves${queryString}`);
    },

    /**
     * Get leave balance
     */
    getBalance: async (year = null) => {
        const queryString = year ? `?year=${year}` : '';
        return await apiCall(`/leaves/balance${queryString}`);
    },

    /**
     * Get all leave requests (HR/Admin)
     */
    getAll: async (params = {}) => {
        const queryString = buildQueryString(params);
        return await apiCall(`/leaves/all${queryString}`);
    },

    /**
     * Approve leave request (HR/Admin)
     */
    approve: async (id) => {
        return await apiCall(`/leaves/${id}/approve`, {
            method: 'PUT'
        });
    },

    /**
     * Reject leave request (HR/Admin)
     */
    reject: async (id, reason) => {
        return await apiCall(`/leaves/${id}/reject`, {
            method: 'PUT',
            body: JSON.stringify({
                status: 'rejected',
                rejection_reason: reason
            })
        });
    },

    /**
     * Cancel leave request
     */
    cancel: async (id) => {
        return await apiCall(`/leaves/${id}`, {
            method: 'DELETE'
        });
    }
};

export default leaveAPI;
