/**
 * Request Validation Middleware using Joi
 */

import Joi from 'joi';
import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';

/**
 * Validate request data against Joi schema
 */
export const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
                success: false,
                error: ERROR_MESSAGES.VALIDATION_ERROR,
                errors
            });
        }

        // Replace req.body with validated and sanitized data
        req.body = value;
        next();
    };
};

// ============================================
// VALIDATION SCHEMAS
// ============================================

export const authSchemas = {
    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required()
    }),

    register: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        full_name: Joi.string().min(2).max(100).required(),
        employee_id: Joi.string().required(),
        role: Joi.string().valid('admin', 'hr', 'employee').required(),
        department_id: Joi.string().uuid().optional(),
        job_title: Joi.string().optional(),
        phone: Joi.string().optional(),
        join_date: Joi.date().optional()
    })
};

export const employeeSchemas = {
    create: Joi.object({
        email: Joi.string().email().required(),
        full_name: Joi.string().min(2).max(100).required(),
        employee_id: Joi.string().required(),
        role: Joi.string().valid('hr', 'employee').required(),
        department_id: Joi.string().uuid().optional(),
        job_title: Joi.string().optional(),
        phone: Joi.string().optional(),
        date_of_birth: Joi.date().optional(),
        gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').optional(),
        address: Joi.string().optional(),
        city: Joi.string().optional(),
        state: Joi.string().optional(),
        country: Joi.string().default('India'),
        postal_code: Joi.string().optional(),
        employment_type: Joi.string().valid('full-time', 'part-time', 'contract', 'intern').default('full-time'),
        join_date: Joi.date().default(() => new Date()),
        manager_id: Joi.string().uuid().optional()
    }),

    update: Joi.object({
        full_name: Joi.string().min(2).max(100).optional(),
        phone: Joi.string().optional(),
        date_of_birth: Joi.date().optional(),
        gender: Joi.string().valid('male', 'female', 'other', 'prefer_not_to_say').optional(),
        address: Joi.string().optional(),
        city: Joi.string().optional(),
        state: Joi.string().optional(),
        country: Joi.string().optional(),
        postal_code: Joi.string().optional(),
        department_id: Joi.string().uuid().optional(),
        job_title: Joi.string().optional(),
        employment_type: Joi.string().valid('full-time', 'part-time', 'contract', 'intern').optional(),
        status: Joi.string().valid('active', 'inactive', 'on-leave', 'terminated').optional(),
        manager_id: Joi.string().uuid().optional().allow(null)
    })
};

export const attendanceSchemas = {
    checkIn: Joi.object({
        check_in_location: Joi.object({
            lat: Joi.number().required(),
            lng: Joi.number().required(),
            address: Joi.string().optional()
        }).optional()
    }),

    checkOut: Joi.object({
        check_out_location: Joi.object({
            lat: Joi.number().required(),
            lng: Joi.number().required(),
            address: Joi.string().optional()
        }).optional()
    }),

    create: Joi.object({
        user_id: Joi.string().uuid().required(),
        date: Joi.date().required(),
        check_in_time: Joi.date().required(),
        check_out_time: Joi.date().optional(),
        status: Joi.string().valid('present', 'absent', 'late', 'half-day', 'work-from-home').default('present'),
        notes: Joi.string().optional()
    })
};

export const leaveSchemas = {
    create: Joi.object({
        leave_type: Joi.string().valid('sick', 'casual', 'earned', 'maternity', 'paternity', 'unpaid').required(),
        start_date: Joi.date().required(),
        end_date: Joi.date().min(Joi.ref('start_date')).required(),
        reason: Joi.string().min(10).required(),
        emergency_contact: Joi.string().optional()
    }),

    update: Joi.object({
        status: Joi.string().valid('approved', 'rejected', 'cancelled').required(),
        rejection_reason: Joi.string().when('status', {
            is: 'rejected',
            then: Joi.string().required(),
            otherwise: Joi.string().optional()
        })
    })
};

export default { validate, authSchemas, employeeSchemas, attendanceSchemas, leaveSchemas };
