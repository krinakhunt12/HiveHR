/**
 * File API Service
 */
import { apiCall } from './apiConfig';

export const fileAPI = {
    /**
     * Get all files
     */
    getFiles: async () => {
        return await apiCall('/files');
    },

    /**
     * Get upload URL and log document entry
     */
    getUploadUrl: async (fileData) => {
        return await apiCall('/files/upload-url', {
            method: 'POST',
            body: JSON.stringify(fileData)
        });
    },

    /**
     * Delete a file
     */
    deleteFile: async (id) => {
        return await apiCall(`/files/${id}`, {
            method: 'DELETE'
        });
    }
};

export default fileAPI;
