/**
 * Global Error Handler Middleware
 */

import { HTTP_STATUS, ERROR_MESSAGES } from '../config/constants.js';

/**
 * Custom API Error class
 */
export class ApiError extends Error {
    constructor(statusCode, message, errors = null) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Global error handler
 */
export const errorHandler = (err, req, res, next) => {
    let { statusCode, message, errors } = err;

    // Default to 500 if statusCode is not set
    statusCode = statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
    message = message || ERROR_MESSAGES.INTERNAL_ERROR;

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
        console.error('Error:', {
            statusCode,
            message,
            errors,
            stack: err.stack
        });
    }

    // Send error response
    res.status(statusCode).json({
        success: false,
        error: message,
        ...(errors && { errors }),
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

/**
 * Handle 404 errors
 */
export const notFoundHandler = (req, res, next) => {
    const error = new ApiError(
        HTTP_STATUS.NOT_FOUND,
        `Route ${req.originalUrl} not found`
    );
    next(error);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

export default { ApiError, errorHandler, notFoundHandler, asyncHandler };
