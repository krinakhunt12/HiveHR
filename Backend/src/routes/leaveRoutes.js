/**
 * Leave Routes
 */

import express from 'express';
import {
    createLeaveRequest,
    getMyLeaves,
    getLeaveBalance,
    getAllLeaves,
    approveLeave,
    rejectLeave,
    cancelLeave
} from '../controllers/leaveController.js';
import { authenticate, isHROrAdmin, isManagerOrHROrAdmin } from '../middleware/auth.js';
import { validate, leaveSchemas } from '../middleware/validator.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Employee routes
router.post('/', validate(leaveSchemas.create), asyncHandler(createLeaveRequest));
router.get('/my-leaves', asyncHandler(getMyLeaves));
router.get('/balance', asyncHandler(getLeaveBalance));
router.delete('/:id', asyncHandler(cancelLeave));

// HR/Admin routes
router.get('/all', isManagerOrHROrAdmin, asyncHandler(getAllLeaves));
router.put('/:id/approve', isManagerOrHROrAdmin, asyncHandler(approveLeave));
router.put('/:id/reject', isManagerOrHROrAdmin, validate(leaveSchemas.update), asyncHandler(rejectLeave));

export default router;
