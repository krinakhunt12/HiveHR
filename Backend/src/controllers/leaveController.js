/**
 * Leave Controller
 * Handles leave management operations
 */

import { supabase, supabaseAdmin } from '../config/supabase.js';
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES, ROLES } from '../config/constants.js';
import { ApiError } from '../middleware/errorHandler.js';

/**
 * Calculate number of days between two dates
 */
const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
};

/**
 * @route   POST /api/leaves
 * @desc    Create leave request
 * @access  Private
 */
export const createLeaveRequest = async (req, res, next) => {
    try {
        const userId = req.profile.id;
        const { leave_type, start_date, end_date, reason, emergency_contact } = req.body;

        // Calculate total days
        const total_days = calculateDays(start_date, end_date);

        // Check leave balance
        const currentYear = new Date().getFullYear();
        const { data: balance, error: balanceError } = await supabase
            .from('leave_balance')
            .select('*')
            .eq('user_id', userId)
            .eq('year', currentYear)
            .single();

        if (balanceError || !balance) {
            throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Leave balance not found');
        }

        // Validate sufficient balance
        const leaveTypeMap = {
            sick: { total: balance.sick_leave_total, used: balance.sick_leave_used },
            casual: { total: balance.casual_leave_total, used: balance.casual_leave_used },
            earned: { total: balance.earned_leave_total, used: balance.earned_leave_used },
            maternity: { total: balance.maternity_leave_total, used: balance.maternity_leave_used },
            paternity: { total: balance.paternity_leave_total, used: balance.paternity_leave_used }
        };

        if (leave_type !== 'unpaid') {
            const leaveBalance = leaveTypeMap[leave_type];
            const available = leaveBalance.total - leaveBalance.used;

            if (total_days > available) {
                throw new ApiError(
                    HTTP_STATUS.BAD_REQUEST,
                    `Insufficient ${leave_type} leave balance. Available: ${available} days`
                );
            }
        }

        const companyId = req.profile.company_id;

        // Create leave request
        const { data, error } = await supabase
            .from('leaves')
            .insert({
                user_id: userId,
                company_id: companyId,
                leave_type,
                start_date,
                end_date,
                total_days,
                reason,
                emergency_contact,
                status: 'pending'
            })
            .select()
            .single();

        if (error) {
            throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
        }

        // Create notification for HR/Admin
        await supabase
            .from('notifications')
            .insert({
                user_id: req.profile.manager_id, // Notify manager
                type: 'leave',
                title: 'New Leave Request',
                message: `${req.profile.full_name} has requested ${leave_type} leave from ${start_date} to ${end_date}`,
                related_entity: 'leave',
                related_id: data.id
            });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Leave request submitted successfully',
            data
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/leaves/my-leaves
 * @desc    Get current user's leave requests
 * @access  Private
 */
export const getMyLeaves = async (req, res, next) => {
    try {
        const userId = req.profile.id;
        const { status, year, page = 1, limit = 20 } = req.query;

        let query = supabase
            .from('leaves')
            .select('*, approved_by_profile:profiles!approved_by(full_name, employee_id)', { count: 'exact' })
            .eq('user_id', userId)
            .eq('company_id', req.profile.company_id)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        if (year) {
            const startOfYear = `${year}-01-01`;
            const endOfYear = `${year}-12-31`;
            query = query.gte('start_date', startOfYear).lte('end_date', endOfYear);
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
                leaves: data,
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
 * @route   GET /api/leaves/balance
 * @desc    Get leave balance for current user
 * @access  Private
 */
export const getLeaveBalance = async (req, res, next) => {
    try {
        const userId = req.profile.id;
        const { year = new Date().getFullYear() } = req.query;

        const { data, error } = await supabase
            .from('leave_balance')
            .select('*')
            .eq('user_id', userId)
            .eq('company_id', req.profile.company_id)
            .eq('year', year)
            .single();

        if (error && error.code !== 'PGRST116') {
            throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
        }

        // If no balance exists, create one
        if (!data) {
            const defaultBalance = {
                user_id: userId,
                year,
                sick_leave_total: 8,
                casual_leave_total: 8,
                earned_leave_total: 12,
                maternity_leave_total: 180,
                paternity_leave_total: 15,
                sick_leave_used: 0,
                casual_leave_used: 0,
                earned_leave_used: 0,
                maternity_leave_used: 0,
                paternity_leave_used: 0
            };

            // Attempt to persist the new balance
            try {
                const { data: newBalance, error: createError } = await supabase
                    .from('leave_balance')
                    .insert(defaultBalance)
                    .select()
                    .single();

                if (!createError && newBalance) {
                    return res.status(HTTP_STATUS.OK).json({
                        success: true,
                        data: newBalance
                    });
                }
            } catch (err) {
                console.error('Persistence failed:', err.message);
            }

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                data: defaultBalance
            });
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/leaves/all
 * @desc    Get all leave requests (HR/Admin)
 * @access  Private/HR/Admin
 */
export const getAllLeaves = async (req, res, next) => {
    try {
        const {
            status,
            leave_type,
            department_id,
            start_date,
            end_date,
            page = 1,
            limit = 50
        } = req.query;

        let query = supabase
            .from('leaves')
            .select(`
        *,
        user:profiles!user_id(id, full_name, employee_id, department_id),
        approved_by_profile:profiles!approved_by(full_name, employee_id)
      `, { count: 'exact' })
            .eq('company_id', req.profile.company_id)
            .order('created_at', { ascending: false });

        // Department Access Control
        // If user is NOT admin, restrict to their own department
        if (req.profile.role !== 'admin') {
            const { data: deptUsers } = await supabase
                .from('profiles')
                .select('id')
                .eq('department_id', req.profile.department_id);

            const userIds = deptUsers ? deptUsers.map(u => u.id) : [];
            query = query.in('user_id', userIds);
        } else if (department_id) {
            // Only allow filtering by specific department if Admin
            const { data: deptUsers } = await supabase
                .from('profiles')
                .select('id')
                .eq('department_id', department_id);

            const userIds = deptUsers ? deptUsers.map(u => u.id) : [];
            if (userIds.length > 0) {
                query = query.in('user_id', userIds);
            } else {
                // return empty if dept found no users
                query = query.eq('id', 0);
            }
        }

        if (status) {
            query = query.eq('status', status);
        }

        if (leave_type) {
            query = query.eq('leave_type', leave_type);
        }

        if (start_date) {
            query = query.gte('start_date', start_date);
        }

        if (end_date) {
            query = query.lte('end_date', end_date);
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
                leaves: data,
                pagination: {
                    total: count,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total_pages: Math.ceil(count / limit)
                }
            }
        });
    } catch (error) {
        console.error('Error in getAllLeaves:', error);
        next(error);
    }
};

/**
 * @route   PUT /api/leaves/:id/approve
 * @desc    Approve leave request
 * @access  Private/HR/Admin
 */
export const approveLeave = async (req, res, next) => {
    try {
        const { id } = req.params;
        const approverId = req.profile.id;

        // Get leave request
        const { data: leave, error: fetchError } = await supabase
            .from('leaves')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !leave) {
            throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Leave request not found');
        }

        if (leave.status !== 'pending') {
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Leave request is not pending');
        }

        // Update leave status
        const { data, error } = await supabaseAdmin
            .from('leaves')
            .update({
                status: 'approved',
                approved_by: approverId,
                approved_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
        }

        // Update leave balance
        const currentYear = new Date().getFullYear();
        const leaveTypeField = `${leave.leave_type}_leave_used`;

        await supabaseAdmin
            .from('leave_balance')
            .update({
                [leaveTypeField]: supabase.raw(`${leaveTypeField} + ${leave.total_days}`)
            })
            .eq('user_id', leave.user_id)
            .eq('year', currentYear);

        // Notify employee
        await supabase
            .from('notifications')
            .insert({
                user_id: leave.user_id,
                type: 'success',
                title: 'Leave Approved',
                message: `Your ${leave.leave_type} leave request has been approved`,
                related_entity: 'leave',
                related_id: id
            });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Leave request approved successfully',
            data
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/leaves/:id/reject
 * @desc    Reject leave request
 * @access  Private/HR/Admin
 */
export const rejectLeave = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rejection_reason } = req.body;
        const approverId = req.profile.id;

        // Get leave request
        const { data: leave, error: fetchError } = await supabase
            .from('leaves')
            .select('*')
            .eq('id', id)
            .single();

        if (fetchError || !leave) {
            throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Leave request not found');
        }

        if (leave.status !== 'pending') {
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Leave request is not pending');
        }

        // Update leave status
        const { data, error } = await supabaseAdmin
            .from('leaves')
            .update({
                status: 'rejected',
                approved_by: approverId,
                approved_at: new Date().toISOString(),
                rejection_reason
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
        }

        // Notify employee
        await supabase
            .from('notifications')
            .insert({
                user_id: leave.user_id,
                type: 'warning',
                title: 'Leave Rejected',
                message: `Your ${leave.leave_type} leave request has been rejected. Reason: ${rejection_reason}`,
                related_entity: 'leave',
                related_id: id
            });

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Leave request rejected',
            data
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   DELETE /api/leaves/:id
 * @desc    Cancel leave request
 * @access  Private
 */
export const cancelLeave = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.profile.id;

        // Get leave request
        const { data: leave, error: fetchError } = await supabase
            .from('leaves')
            .select('*')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (fetchError || !leave) {
            throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Leave request not found');
        }

        if (leave.status === 'cancelled') {
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Leave request is already cancelled');
        }

        // Update leave status
        const { data, error } = await supabase
            .from('leaves')
            .update({ status: 'cancelled' })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
        }

        // If leave was approved, restore balance
        if (leave.status === 'approved' && leave.leave_type !== 'unpaid') {
            const currentYear = new Date().getFullYear();
            const leaveTypeField = `${leave.leave_type}_leave_used`;

            await supabaseAdmin
                .from('leave_balance')
                .update({
                    [leaveTypeField]: supabase.raw(`${leaveTypeField} - ${leave.total_days}`)
                })
                .eq('user_id', leave.user_id)
                .eq('year', currentYear);
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Leave request cancelled successfully',
            data
        });
    } catch (error) {
        next(error);
    }
};

export default {
    createLeaveRequest,
    getMyLeaves,
    getLeaveBalance,
    getAllLeaves,
    approveLeave,
    rejectLeave,
    cancelLeave
};
