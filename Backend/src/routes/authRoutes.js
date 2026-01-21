/**
 * Authentication Routes
 */

import express from 'express';
import {
    login,
    register,
    logout,
    getCurrentUser,
    refreshToken,
    changePassword
} from '../controllers/authController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { validate, authSchemas } from '../middleware/validator.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// Public routes
router.post('/login', validate(authSchemas.login), asyncHandler(login));
router.post('/refresh', asyncHandler(refreshToken));

// Protected routes
router.post('/logout', authenticate, asyncHandler(logout));
router.get('/me', authenticate, asyncHandler(getCurrentUser));
router.post('/change-password', authenticate, asyncHandler(changePassword));

// Admin only routes
router.post('/register', authenticate, isAdmin, validate(authSchemas.register), asyncHandler(register));

export default router;
