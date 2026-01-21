/**
 * Employee Controller
 * Handles employee management operations
 */

import { supabase, supabaseAdmin } from '../config/supabase.js';
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES, ROLES } from '../config/constants.js';
import { ApiError } from '../middleware/errorHandler.js';

/**
 * @route   GET /api/employees
 * @desc    Get all employees (with filters)
 * @access  Private/HR/CompanyAdmin
 */
export const getAllEmployees = async (req, res, next) => {
    try {
        const {
            department_id,
            status,
            role,
            search,
            page = 1,
            limit = 10,
            sort_by = 'created_at',
            sort_order = 'desc'
        } = req.query;

        const companyId = req.profile.company_id;

        let query = supabase
            .from('profiles')
            .select('*, departments!department_id(name)', { count: 'exact' })
            .eq('company_id', companyId);

        // Apply filters
        if (department_id) {
            query = query.eq('department_id', department_id);
        }

        if (status) {
            query = query.eq('status', status);
        }

        if (role) {
            query = query.eq('role', role);
        }

        if (search) {
            query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,employee_id.ilike.%${search}%`);
        }

        // Sorting
        query = query.order(sort_by, { ascending: sort_order === 'asc' });

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
                employees: data,
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
 * @route   GET /api/employees/:id
 * @desc    Get employee by ID
 * @access  Private
 */
export const getEmployeeById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const { data, error } = await supabase
            .from('profiles')
            .select(`
        *,
        departments!department_id(id, name, description),
        manager:profiles!manager_id(id, full_name, email, employee_id)
      `)
            .eq('id', id)
            .eq('company_id', req.profile.company_id)
            .single();

        if (error || !data) {
            throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Employee not found');
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
 * @route   POST /api/employees
 * @desc    Create new employee
 * @access  Private/Admin
 */
export const createEmployee = async (req, res, next) => {
    try {
        const employeeData = req.body;

        // Generate random password (should be sent via email in production)
        const tempPassword = Math.random().toString(36).slice(-8) + 'Aa1!';

        // Check if employee_id already exists
        const { data: existingEmployee } = await supabaseAdmin
            .from('profiles')
            .select('employee_id')
            .eq('employee_id', employeeData.employee_id)
            .single();

        if (existingEmployee) {
            throw new ApiError(HTTP_STATUS.CONFLICT, 'Employee ID already exists');
        }

        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: employeeData.email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: {
                full_name: employeeData.full_name,
                employee_id: employeeData.employee_id,
                role: employeeData.role
            }
        });

        if (authError) {
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, authError.message);
        }

        // Create profile
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
                id: authData.user.id,
                ...employeeData,
                status: 'active'
            })
            .select()
            .single();

        if (profileError) {
            // Rollback
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to create employee profile');
        }

        // Create leave balance
        const currentYear = new Date().getFullYear();
        await supabaseAdmin
            .from('leave_balance')
            .insert({
                user_id: authData.user.id,
                year: currentYear
            });

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: SUCCESS_MESSAGES.CREATED,
            data: {
                employee: profile,
                temporary_password: tempPassword // In production, send via email
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   PUT /api/employees/:id
 * @desc    Update employee
 * @access  Private/HR/Admin
 */
export const updateEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Check if employee exists within the company
        const { data: existingEmployee } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', id)
            .eq('company_id', req.profile.company_id)
            .single();

        if (!existingEmployee) {
            throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Employee not found');
        }

        // Update profile
        const { data, error } = await supabaseAdmin
            .from('profiles')
            .update(updates)
            .eq('id', id)
            .eq('company_id', req.profile.company_id)
            .select()
            .single();

        if (error) {
            throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: SUCCESS_MESSAGES.UPDATED,
            data
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   DELETE /api/employees/:id
 * @desc    Delete employee
 * @access  Private/Admin
 */
export const deleteEmployee = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if employee exists within the company
        const { data: existingEmployee } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', id)
            .eq('company_id', req.profile.company_id)
            .single();

        if (!existingEmployee) {
            throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Employee not found');
        }

        // Delete auth user (cascade will delete profile)
        const { error } = await supabaseAdmin.auth.admin.deleteUser(id);

        if (error) {
            throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, error.message);
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: SUCCESS_MESSAGES.DELETED
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/employees/:id/stats
 * @desc    Get employee statistics
 * @access  Private
 */
export const getEmployeeStats = async (req, res, next) => {
    try {
        const { id } = req.params;

        const today = new Date().toISOString().split('T')[0];

        // Get attendance stats
        const { data: attendanceData } = await supabase
            .from('attendance')
            .select('status')
            .eq('user_id', id)
            .gte('date', new Date(new Date().getFullYear(), 0, 1).toISOString());

        // Get today's attendance
        const { data: attendanceToday } = await supabase
            .from('attendance')
            .select('*')
            .eq('user_id', id)
            .eq('date', today)
            .single();

        // Get leave stats
        const { data: leaveData } = await supabase
            .from('leave_balance')
            .select('*')
            .eq('user_id', id)
            .eq('year', new Date().getFullYear())
            .single();

        // Get pending leaves
        const { data: pendingLeaves } = await supabase
            .from('leaves')
            .select('*')
            .eq('user_id', id)
            .eq('status', 'pending');

        const stats = {
            attendance: {
                total_days: attendanceData?.length || 0,
                present: attendanceData?.filter(a => a.status === 'present').length || 0,
                late: attendanceData?.filter(a => a.status === 'late').length || 0,
                absent: attendanceData?.filter(a => a.status === 'absent').length || 0,
                work_from_home: attendanceData?.filter(a => a.status === 'work-from-home').length || 0
            },
            attendanceToday: attendanceToday || null,
            leaves: {
                balance: leaveData || {},
                pending_requests: pendingLeaves?.length || 0
            }
        };

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: stats
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeStats
};
