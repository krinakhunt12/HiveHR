/**
 * Authentication Middleware
 * Verifies JWT tokens and user permissions
 */

import { supabase } from '../config/supabase.js';
import { ROLES, HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = async (req, res, next) => {
    try {
        // Extract token from Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                error: ERROR_MESSAGES.UNAUTHORIZED,
                message: 'No token provided'
            });
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token with Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                error: ERROR_MESSAGES.INVALID_TOKEN,
                message: error?.message || 'Invalid token'
            });
        }

        // Fetch user profile with role information
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                error: ERROR_MESSAGES.UNAUTHORIZED,
                message: 'User profile not found'
            });
        }

        // Check if user is active
        if (profile.status !== 'active') {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                error: ERROR_MESSAGES.FORBIDDEN,
                message: 'User account is not active'
            });
        }

        // Attach user and profile to request
        req.user = user;
        req.profile = profile;
        req.token = token;

        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            error: ERROR_MESSAGES.INTERNAL_ERROR,
            message: 'Authentication failed'
        });
    }
};

/**
 * Authorize based on user roles
 * @param  {...string} allowedRoles - Roles that are allowed to access the route
 */
export const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.profile) {
            return res.status(HTTP_STATUS.UNAUTHORIZED).json({
                success: false,
                error: ERROR_MESSAGES.UNAUTHORIZED,
                message: 'User not authenticated'
            });
        }

        const userRole = req.profile.role;

        if (!allowedRoles.includes(userRole)) {
            return res.status(HTTP_STATUS.FORBIDDEN).json({
                success: false,
                error: ERROR_MESSAGES.FORBIDDEN,
                message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
            });
        }

        next();
    };
};

/**
 * Check if user is admin
 */
export const isAdmin = authorize(ROLES.ADMIN);

/**
 * Check if user is HR or Admin
 */
export const isHROrAdmin = authorize(ROLES.HR, ROLES.ADMIN);

/**
 * Check if user is accessing their own resource
 */
export const isSelfOrAdmin = (req, res, next) => {
    const requestedUserId = req.params.userId || req.params.id;
    const currentUserId = req.profile.id;
    const isAdmin = req.profile.role === ROLES.ADMIN;

    if (currentUserId === requestedUserId || isAdmin) {
        return next();
    }

    return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        error: ERROR_MESSAGES.FORBIDDEN,
        message: 'You can only access your own resources'
    });
};

export default { authenticate, authorize, isAdmin, isHROrAdmin, isSelfOrAdmin };
