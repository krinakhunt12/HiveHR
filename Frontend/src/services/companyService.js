/**
 * Company API Service
 */
import { apiCall } from './apiConfig';

export const companyAPI = {
    /**
     * Register a new company (Public)
     */
    register: async (companyData) => {
        return await apiCall('/companies/register', {
            method: 'POST',
            body: JSON.stringify(companyData)
        });
    },

    /**
     * Get current company details
     */
    getMyCompany: async () => {
        return await apiCall('/companies/me');
    }
};

export default companyAPI;
