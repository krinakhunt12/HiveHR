/**
 * Admin Controller
 * Handles system-wide admin operations
 */

import { supabase } from '../config/supabase.js';
import { HTTP_STATUS, ROLES } from '../config/constants.js';
import { ApiError } from '../middleware/errorHandler.js';

/**
 * @route   GET /api/admin/stats
 * @desc    Get aggregate stats for Admin dashboard
 * @access  Private (Admin)
 */
export const getAdminStats = async (req, res, next) => {
    try {
        const companyId = req.profile.company_id;

        // Fetch all profiles for the company
        const { data: users, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('company_id', companyId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const stats = {
            totalEmployees: users.filter(u => u.role === ROLES.EMPLOYEE).length,
            totalHR: users.filter(u => u.role === ROLES.HR).length,
            totalManagers: users.filter(u => u.role === ROLES.MANAGER).length,
            activeUsers: users.filter(u => u.status === 'active').length,
            inactiveUsers: users.filter(u => u.status === 'inactive').length
        };

        const recentActivity = users.slice(0, 5).map(u => ({
            id: u.id,
            type: 'Event',
            title: `Identity Initialized`,
            description: `${u.full_name} joined as ${u.role?.toUpperCase()}`,
            time: new Date(u.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date(u.created_at).toLocaleDateString()
        }));

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data: {
                stats,
                users,
                recentActivity
            }
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getAdminStats
};
