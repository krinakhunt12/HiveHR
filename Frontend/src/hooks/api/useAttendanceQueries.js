/**
 * Attendance Query Hooks
 * TanStack Query hooks for attendance management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceAPI } from '../../services/attendanceService';
import { queryKeys } from '../../config/queryClient';
import { toast } from '../../utils/toast';

/**
 * Get my attendance records
 */
export const useMyAttendance = (params = {}, options = {}) => {
    return useQuery({
        queryKey: queryKeys.attendance.my(params),
        queryFn: () => attendanceAPI.getMyAttendance(params),
        ...options
    });
};

/**
 * Get today's attendance status
 */
export const useTodayAttendance = (options = {}) => {
    return useQuery({
        queryKey: queryKeys.attendance.today,
        queryFn: attendanceAPI.getTodayAttendance,
        refetchInterval: 60000, // Refetch every minute
        ...options
    });
};

/**
 * Get employee attendance (HR/Admin)
 */
export const useEmployeeAttendance = (userId, params = {}, options = {}) => {
    return useQuery({
        queryKey: queryKeys.attendance.employee(userId, params),
        queryFn: () => attendanceAPI.getEmployeeAttendance(userId, params),
        enabled: !!userId,
        ...options
    });
};

/**
 * Get all attendance records (HR/Admin)
 */
export const useAllAttendance = (params = {}, options = {}) => {
    return useQuery({
        queryKey: queryKeys.attendance.all(params),
        queryFn: () => attendanceAPI.getAll(params),
        ...options
    });
};

/**
 * Get attendance statistics (HR/Admin)
 */
export const useAttendanceStats = (params = {}, options = {}) => {
    return useQuery({
        queryKey: queryKeys.attendance.stats(params),
        queryFn: () => attendanceAPI.getStats(params),
        ...options
    });
};

/**
 * Check in mutation
 */
export const useCheckIn = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (location) => attendanceAPI.checkIn(location),
        onSuccess: () => {
            toast.success('Checked in successfully!');

            // Invalidate attendance queries
            queryClient.invalidateQueries({ queryKey: queryKeys.attendance.today });
            queryClient.invalidateQueries({ queryKey: ['attendance', 'my'] });
        }
    });
};

/**
 * Check out mutation
 */
export const useCheckOut = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (location) => attendanceAPI.checkOut(location),
        onSuccess: () => {
            toast.success('Checked out successfully!');

            // Invalidate attendance queries
            queryClient.invalidateQueries({ queryKey: queryKeys.attendance.today });
            queryClient.invalidateQueries({ queryKey: ['attendance', 'my'] });
        }
    });
};

/**
 * Create manual attendance mutation (HR/Admin)
 */
export const useCreateManualAttendance = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (attendanceData) => attendanceAPI.createManual(attendanceData),
        onSuccess: () => {
            toast.success('Attendance record created successfully!');

            // Invalidate all attendance queries
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
        }
    });
};
