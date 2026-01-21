/**
 * Attendance API Service
 * All attendance-related API calls
 */

import { apiCall, buildQueryString } from './apiConfig';

export const attendanceAPI = {
    /**
     * Check in
     */
    checkIn: async (location = null) => {
        return await apiCall('/attendance/check-in', {
            method: 'POST',
            body: JSON.stringify({
                check_in_location: location
            })
        });
    },

    /**
     * Check out
     */
    checkOut: async (location = null) => {
        return await apiCall('/attendance/check-out', {
            method: 'POST',
            body: JSON.stringify({
                check_out_location: location
            })
        });
    },

    /**
     * Get my attendance records
     */
    getMyAttendance: async (params = {}) => {
        const queryString = buildQueryString(params);
        return await apiCall(`/attendance/my-attendance${queryString}`);
    },

    /**
     * Get today's attendance status
     */
    getTodayAttendance: async () => {
        return await apiCall('/attendance/today');
    },

    /**
     * Get attendance configuration rules
     */
    getAttendanceConfig: async () => {
        return await apiCall('/attendance/config');
    },

    /**
     * Get employee attendance (HR/Admin)
     */
    getEmployeeAttendance: async (userId, params = {}) => {
        const queryString = buildQueryString(params);
        return await apiCall(`/attendance/employee/${userId}${queryString}`);
    },

    /**
     * Get all attendance records (HR/Admin)
     */
    getAll: async (params = {}) => {
        const queryString = buildQueryString(params);
        return await apiCall(`/attendance/all${queryString}`);
    },

    /**
     * Create manual attendance record (HR/Admin)
     */
    createManual: async (attendanceData) => {
        return await apiCall('/attendance/manual', {
            method: 'POST',
            body: JSON.stringify(attendanceData)
        });
    },

    /**
     * Get attendance statistics (HR/Admin)
     */
    getStats: async (params = {}) => {
        const queryString = buildQueryString(params);
        return await apiCall(`/attendance/stats${queryString}`);
    }
};

export default attendanceAPI;
