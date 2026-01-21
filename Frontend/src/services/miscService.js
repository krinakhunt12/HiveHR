/**
 * Misc API Service
 */
import { apiCall } from './apiConfig';

export const miscAPI = {
    /**
     * Get application configuration and constants
     */
    getAppConfig: async () => {
        return await apiCall('/misc/config');
    },

    /**
     * Get landing page data
     */
    getLandingPageData: async () => {
        return await apiCall('/misc/landing-page');
    },

    /**
     * Get holidays
     */
    getHolidays: async () => {
        return await apiCall('/misc/holidays');
    }
};

export default miscAPI;
