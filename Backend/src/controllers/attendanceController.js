/**
 * Attendance Controller
 * Handles attendance tracking operations
 */

import { supabase, supabaseAdmin } from '../config/supabase.js';
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants.js';
import { ApiError } from '../middleware/errorHandler.js';

/**
 * @route   POST /api/attendance/check-in
 * @desc    Check in for the day
 * @access  Private
 */
export const checkIn = async (req, res, next) => {
    try {
        const userId = req.profile.id;
        const { check_in_location } = req.body;
        const today = new Date().toISOString().split('T')[0];

        // Check if already checked in today
        const { data: existingAttendance } = await supabase
            .from('attendance')
            .select('*')
            .eq('user_id', userId)
            .eq('date', today)
            .single();

        if (existingAttendance) {
            throw new ApiError(HTTP_STATUS.CONFLICT, 'Already checked in for today');
        }

        // Determine if late (after 11:00 AM)
        const checkInTime = new Date();
        const lateTime = new Date();
        lateTime.setHours(11, 0, 0, 0); // 11:00 AM

        // If checking in after 11:00 AM, mark as half-day immediately? 
        // Or marked as 'late' and then 'half-day' calculated later?
        // Requirement: "If an employee punches in after 11:00 AM, mark the day as Half Day"
        const status = checkInTime > lateTime ? 'half-day' : 'present';

        const companyId = req.profile.company_id;

        // Create attendance record
        const { data, error } = await supabase
            .from('attendance')
            .insert({
                user_id: userId,
                company_id: companyId,
                date: today,
                check_in_time: checkInTime.toISOString(),
                check_in_location,
                status
            })
            .select()
            .single();

        if (error) {
            throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
        }

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Checked in successfully',
            data
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/attendance/check-out
 * @desc    Check out for the day
 * @access  Private
 */
export const checkOut = async (req, res, next) => {
    try {
        const userId = req.profile.id;
        const { check_out_location } = req.body;
        const today = new Date().toISOString().split('T')[0];

        // Get today's attendance record
        const { data: attendance, error: fetchError } = await supabase
            .from('attendance')
            .select('*')
            .eq('user_id', userId)
            .eq('date', today)
            .single();

        if (fetchError || !attendance) {
            throw new ApiError(HTTP_STATUS.NOT_FOUND, 'No check-in record found for today');
        }

        if (attendance.check_out_time) {
            throw new ApiError(HTTP_STATUS.CONFLICT, 'Already checked out for today');
        }

        const checkOutTime = new Date();
        const checkInTime = new Date(attendance.check_in_time);
        const durationMs = checkOutTime - checkInTime;
        const totalHours = Number((durationMs / (1000 * 60 * 60)).toFixed(2));

        // Determine Final Status
        // Rule: >= 9 hours = Full Day
        // Rule: < 9 hours = Half Day (enforced strict 9h rule for full day)
        // If they were already 'half-day' due to late entry, and worked < 9h, it remains half-day.
        // If they worked >= 9h, we upgrade to full-day (assuming flexible timing allows makeup).
        // Otherwise, if strictly < 9h, it is half-day.
        let status = totalHours >= 9 ? 'full-day' : 'half-day';

        // Update attendance record
        const { data, error } = await supabase
            .from('attendance')
            .update({
                check_out_time: checkOutTime.toISOString(),
                check_out_location,
                total_hours: totalHours,
                status
            })
            .eq('id', attendance.id)
            .select()
            .single();

        if (error) {
            throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Checked out successfully',
            data
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/attendance/my-attendance
 * @desc    Get current user's attendance records
 * @access  Private
 */
export const getMyAttendance = async (req, res, next) => {
    try {
        const userId = req.profile.id;
        const { start_date, end_date, page = 1, limit = 30 } = req.query;

        let query = supabase
            .from('attendance')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .eq('company_id', req.profile.company_id)
            .order('date', { ascending: false });

        if (start_date) {
            query = query.gte('date', start_date);
        }

        if (end_date) {
            query = query.lte('date', end_date);
        }

        // Pagination
        const from = (page - 1) * limit;
        const to = from + parseInt(limit) - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
            throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                attendance: data,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total_pages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/attendance/today
 * @desc    Get today's attendance status
 * @access  Private
 */
export const getTodayAttendance = async (req, res, next) => {
    try {
        const userId = req.profile.id;
        const today = new Date().toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('user_id', userId)
            .eq('company_id', req.profile.company_id)
            .eq('date', today)
            .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: data || null
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/attendance/employee/:userId
 * @desc    Get attendance records for specific employee
 * @access  Private/HR/Admin
 */
export const getEmployeeAttendance = async (req, res, next) => {
    try {
        const { userId } = req.params;
        const { start_date, end_date, page = 1, limit = 30 } = req.query;

        let query = supabase
            .from('attendance')
            .select('*', { count: 'exact' })
            .eq('user_id', userId)
            .eq('company_id', req.profile.company_id)
            .order('date', { ascending: false });

        if (start_date) {
            query = query.gte('date', start_date);
        }

        if (end_date) {
            query = query.lte('date', end_date);
        }

        // Pagination
        const from = (page - 1) * limit;
        const to = from + parseInt(limit) - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
            throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                attendance: data,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total_pages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/attendance/all
 * @desc    Get all attendance records (with filters)
 * @access  Private/HR/Admin
 */
export const getAllAttendance = async (req, res, next) => {
    try {
        const {
            date,
            status,
            department_id,
            page = 1,
            limit = 50
        } = req.query;

        let query = supabase
            .from('attendance')
            .select(`
        *,
        profiles!inner(
          id,
          full_name,
          employee_id,
          department_id,
          departments!department_id(name)
        )
      `, { count: 'exact' })
            .eq('company_id', req.profile.company_id)
            .order('date', { ascending: false });

        // Department Access Control
        // If user is NOT admin, restrict to their own department
        if (req.profile.role !== 'admin') {
            query = query.eq('profiles.department_id', req.profile.department_id);
        } else if (department_id) {
            // Only allow filtering by specific department if Admin
            query = query.eq('profiles.department_id', department_id);
        }

        if (date) {
            query = query.eq('date', date);
        }

        if (status) {
            query = query.eq('status', status);
        }

        // Pagination
        const from = (page - 1) * limit;
        const to = from + parseInt(limit) - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) {
            throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                attendance: data,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total_pages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/attendance/manual
 * @desc    Manually create attendance record (Admin/HR only)
 * @access  Private/HR/Admin
 */
export const createManualAttendance = async (req, res, next) => {
    try {
        const attendanceData = req.body;

        // Check if attendance already exists for this user and date
        const { data: existing } = await supabase
            .from('attendance')
            .select('id')
            .eq('user_id', attendanceData.user_id)
            .eq('date', attendanceData.date)
            .single();

        if (existing) {
            throw new ApiError(HTTP_STATUS.CONFLICT, 'Attendance record already exists for this date');
        }

        const { data, error } = await supabaseAdmin
            .from('attendance')
            .insert(attendanceData)
            .select()
            .single();

        if (error) {
            throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
        }

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: SUCCESS_MESSAGES.CREATED,
            data
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/attendance/stats
 * @desc    Get attendance statistics
 * @access  Private/HR/Admin
 */
export const getAttendanceStats = async (req, res, next) => {
    try {
        const { start_date, end_date, department_id } = req.query;
        const today = new Date().toISOString().split('T')[0];

        let query = supabase
            .from('attendance')
            .select('status, profiles!inner(department_id)');

        if (start_date) {
            query = query.gte('date', start_date);
        } else {
            query = query.gte('date', today);
        }

        if (end_date) {
            query = query.lte('date', end_date);
        } else {
            query = query.lte('date', today);
        }

        if (department_id) {
            query = query.eq('profiles.department_id', department_id);
        }

        const { data, error } = await query;

        if (error) {
            throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
        }

        const stats = {
            total: data.length,
            present: data.filter(a => a.status === 'present').length,
            late: data.filter(a => a.status === 'late').length,
            absent: data.filter(a => a.status === 'absent').length,
            work_from_home: data.filter(a => a.status === 'work-from-home').length,
            half_day: data.filter(a => a.status === 'half-day').length
        };

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/attendance/config
 * @desc    Get attendance configuration rules
 * @access  Private
 */
export const getAttendanceConfig = async (req, res, next) => {
    try {
        // These can be moved to a 'settings' table in the DB for full configurability
        const config = {
            office_hours: {
                start: '10:00',
                end: '19:00',
                full_day_hours: 9
            },
            status_rules: {
                late_entry_threshold: '11:00',
                half_day_hours_threshold: 4.5,
                full_day_hours_threshold: 9
            }
        };

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: config
        });
    } catch (error) {
        next(error);
    }
};

export default {
    checkIn,
    checkOut,
    getMyAttendance,
    getTodayAttendance,
    getEmployeeAttendance,
    getAllAttendance,
    createManualAttendance,
    getAttendanceStats,
    getAttendanceConfig
};
