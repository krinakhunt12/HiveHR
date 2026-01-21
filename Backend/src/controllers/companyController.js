/**
 * Company Controller
 * Handles multi-tenant company operations
 */

import { supabase, supabaseAdmin } from '../config/supabase.js';
import { HTTP_STATUS, ROLES, PLAN_TYPES, PLAN_LIMITS } from '../config/constants.js';
import { ApiError } from '../middleware/errorHandler.js';

/**
 * @route   POST /api/companies/register
 * @desc    Register a new company and its admin
 * @access  Public
 */
export const registerCompany = async (req, res, next) => {
    try {
        const {
            company_name,
            email,
            password,
            full_name,
            plan_type = PLAN_TYPES.BASIC
        } = req.body;

        // 1. Create Company entry
        const { data: company, error: companyError } = await supabaseAdmin
            .from('companies')
            .insert({
                name: company_name,
                plan_type,
                status: 'active',
                settings: PLAN_LIMITS[plan_type]
            })
            .select()
            .single();

        if (companyError) {
            throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, companyError.message);
        }

        // 2. Create Company Admin user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: {
                full_name,
                role: ROLES.COMPANY_ADMIN,
                company_id: company.id
            }
        });

        if (authError) {
            // Rollback company
            await supabaseAdmin.from('companies').delete().eq('id', company.id);
            throw new ApiError(HTTP_STATUS.BAD_REQUEST, authError.message);
        }

        // 3. Create Admin Profile
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
                id: authData.user.id,
                email,
                full_name,
                role: ROLES.COMPANY_ADMIN,
                company_id: company.id,
                status: 'active',
                join_date: new Date().toISOString().split('T')[0]
            })
            .select()
            .single();

        if (profileError) {
            // Rollback both
            await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
            await supabaseAdmin.from('companies').delete().eq('id', company.id);
            throw new ApiError(HTTP_STATUS.INTERNAL_SERVER_ERROR, 'Failed to create admin profile');
        }

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            message: 'Company registered successfully',
            data: {
                company,
                profile
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/companies/me
 * @desc    Get current company details
 * @access  Private (Company Admin)
 */
export const getMyCompany = async (req, res, next) => {
    try {
        const companyId = req.profile.company_id;

        const { data, error } = await supabase
            .from('companies')
            .select('*')
            .eq('id', companyId)
            .single();

        if (error) {
            throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Company not found');
        }

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

export default {
    registerCompany,
    getMyCompany
};
