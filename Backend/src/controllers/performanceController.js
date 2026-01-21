/**
 * Performance Controller
 */
import { supabase } from '../config/supabase.js';
import { HTTP_STATUS } from '../config/constants.js';
import { ApiError } from '../middleware/errorHandler.js';

/**
 * @route   GET /api/performance/my-reviews
 * @desc    Get current user's performance reviews
 * @access  Private
 */
export const getMyReviews = async (req, res, next) => {
    try {
        const userId = req.profile.id;

        const { data, error } = await supabase
            .from('performance_reviews')
            .select(`
                *,
                reviewer:profiles!reviewer_id(full_name, designation)
            `)
            .eq('user_id', userId)
            .order('review_date', { ascending: false });

        if (error) throw error;

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   GET /api/performance/team-reviews
 * @desc    Get team members' performance reviews (Manager/HR/Admin)
 * @access  Private
 */
export const getTeamReviews = async (req, res, next) => {
    try {
        const companyId = req.profile.company_id;

        const { data, error } = await supabase
            .from('performance_reviews')
            .select(`
                *,
                user:profiles!user_id(full_name, employee_id, department_id),
                reviewer:profiles!reviewer_id(full_name)
            `)
            .eq('company_id', companyId)
            .order('review_date', { ascending: false });

        if (error) throw error;

        res.status(HTTP_STATUS.OK).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @route   POST /api/performance
 * @desc    Create a performance review
 * @access  Private (Manager/HR/Admin)
 */
export const createReview = async (req, res, next) => {
    try {
        const reviewerId = req.profile.id;
        const companyId = req.profile.company_id;
        const reviewData = req.body;

        const { data, error } = await supabase
            .from('performance_reviews')
            .insert({
                ...reviewData,
                reviewer_id: reviewerId,
                company_id: companyId,
                review_date: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        res.status(HTTP_STATUS.CREATED).json({
            success: true,
            data
        });
    } catch (error) {
        next(error);
    }
};

export default {
    getMyReviews,
    getTeamReviews,
    createReview
};
