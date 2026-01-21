/**
 * Employee API Service
 * All employee-related API calls
 */

import { apiCall, buildQueryString } from './apiConfig';

export const employeeAPI = {
    /**
     * Get all employees with filters
     */
    getAll: async (params = {}) => {
        const queryString = buildQueryString(params);
        return await apiCall(`/employees${queryString}`);
    },

    /**
     * Get employee by ID
     */
    getById: async (id) => {
        return await apiCall(`/employees/${id}`);
    },

    /**
     * Create new employee (Admin only)
     */
    create: async (employeeData) => {
        return await apiCall('/employees', {
            method: 'POST',
            body: JSON.stringify(employeeData)
        });
    },

    /**
     * Update employee (HR/Admin)
     */
    update: async (id, updates) => {
        return await apiCall(`/employees/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updates)
        });
    },

    /**
     * Delete employee (Admin only)
     */
    delete: async (id) => {
        return await apiCall(`/employees/${id}`, {
            method: 'DELETE'
        });
    },

    /**
     * Get employee statistics
     */
    getStats: async (id) => {
        return await apiCall(`/employees/${id}/stats`);
    }
};

export default employeeAPI;
