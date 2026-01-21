/**
 * Authentication Controller
 * Handles user authentication operations
 */

import { supabase, supabaseAdmin } from '../config/supabase.js';
import { HTTP_STATUS, ERROR_MESSAGES, SUCCESS_MESSAGES } from '../config/constants.js';
import { ApiError } from '../middleware/errorHandler.js';

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Authenticate with Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            throw new ApiError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.INVALID_CREDENTIALS);
        }

        // Fetch user profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (profileError || !profile) {
            throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User profile not found');
        }

        // Check if user is active
        if (profile.status !== 'active') {
            throw new ApiError(HTTP_STATUS.FORBIDDEN, 'User account is not active');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
            data: {
                user: data.user,
                profile,
                session: data.session
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/register
 * @desc    Register new user (Company Admin/HR)
 * @access  Private/CompanyAdmin/HR
 */
export const register = async (req, res, next) => {
    try {
        const {
            email,
            password,
            full_name,
            employee_id,
            role,
            department_id,
            job_title,
            phone,
            join_date,
            employment_type,
            manager_id
        } = req.body;

        const companyId = req.profile.company_id;
        const planType = req.profile.company?.plan_type || PLAN_TYPES.BASIC;
        const limit = PLAN_LIMITS[planType].employees;

        // 1. Check current employee count
        const { count, error: countError } = await supabaseAdmin
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId);

        if (countError) {
            throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to verify plan limits');
        }

        if (count >= limit) {
            throw new ApiError(HTTP_STATUS.FORBIDDEN, `Plan limit reached. Your current plan allows up to ${limit} employees.`);
        }

        // Check if employee_id already exists within the company
        const { data: existingEmployee } = await supabaseAdmin
            .from('profiles')
            .select('employee_id')
            .eq('employee_id', employee_id)
            .eq('company_id', companyId)
            .single();

        if (existingEmployee) {
            throw new ApiError(HTTP_STATUS.CONFLICT, 'Employee ID already exists within this company');
        }

        // Create auth user using admin client
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name,
                employee_id,
                role,
                company_id: companyId
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
                email,
                full_name,
                employee_id,
                role,
                company_id: companyId,
                department_id,
                job_title,
                phone,
                join_date: join_date || new Date().toISOString().split('T')[0],
                employment_type: employment_type || 'full-time',
                status: 'active',
                manager_id
            })
            .select()
            .single();

        if (profileError) {
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to create user profile');
        }

        // Create leave balance for the new employee
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
                user: authData.user,
                profile
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
export const logout = async (req, res, next) => {
    try {
        const { error } = await supabase.auth.signOut();

        if (error) {
            throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Logout failed');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: SUCCESS_MESSAGES.LOGOUT_SUCCESS
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
export const getCurrentUser = async (req, res, next) => {
    try {
        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                user: req.user,
                profile: req.profile
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
export const refreshToken = async (req, res, next) => {
    try {
        const { refresh_token } = req.body;

        if (!refresh_token) {
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Refresh token is required');
        }

        const { data, error } = await supabase.auth.refreshSession({
            refresh_token
        });

        if (error) {
            throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid refresh token');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                session: data.session
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
export const changePassword = async (req, res, next) => {
    try {
        const { current_password, new_password } = req.body;

        // Verify current password
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: req.user.email,
            password: current_password
        });

        if (signInError) {
            throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Current password is incorrect');
        }

        // Update password
        const { error: updateError } = await supabase.auth.updateUser({
            password: new_password
        });

        if (updateError) {
            throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to update password');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        next(error);
    }
};

export default {
    login,
    register,
    logout,
    getCurrentUser,
    refreshToken,
    changePassword
};
