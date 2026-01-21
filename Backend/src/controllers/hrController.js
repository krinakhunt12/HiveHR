/**
 * HR Controller
 * Handles HR-specific aggregate operations
 */

import { supabase } from '../config/supabase.js';
import { HTTP_STATUS } from '../config/constants.js';
import { ApiError } from '../middleware/errorHandler.js';

/**
 * @route   GET /api/hr/stats
 * @desc    Get aggregate stats for HR dashboard
 * @access  Private (HR/Admin)
 */
export const getHRStats = async (req, res, next) => {
    try {
        const companyId = req.profile.company_id;
        const today = new Date().toISOString().split('T')[0];
        const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

        // 1. Total Employees
        const { count: totalEmployees } = await supabase
            .from('profiles')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId)
            .eq('role', 'employee');

        // 2. Present Today
        const { count: presentToday } = await supabase
            .from('attendance')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId)
            .eq('date', today);

        // 3. Pending Leaves
        const { count: pendingLeaves } = await supabase
            .from('leaves')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId)
            .eq('status', 'pending');

        // 4. Approved Leaves (month)
        const { count: approvedLeaves } = await supabase
            .from('leaves')
            .select('*', { count: 'exact', head: true })
            .eq('company_id', companyId)
            .eq('status', 'approved')
            .gte('created_at', firstDayOfMonth);

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                totalEmployees: totalEmployees || 0,
                presentToday: presentToday || 0,
                pendingLeaves: pendingLeaves || 0,
                approvedLeaves: approvedLeaves || 0
            }
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getHRStats
};
