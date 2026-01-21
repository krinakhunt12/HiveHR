/**
 * Attendance Routes
 */

import express from 'express';
import {
    checkIn,
    checkOut,
    getMyAttendance,
    getTodayAttendance,
    getEmployeeAttendance,
    getAllAttendance,
    createManualAttendance,
    getAttendanceStats,
    getAttendanceConfig
} from '../controllers/attendanceController.js';
import { authenticate, isHROrAdmin, isManagerOrHROrAdmin } from '../middleware/auth.js';
import { validate, attendanceSchemas } from '../middleware/validator.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Employee routes
router.post('/check-in', validate(attendanceSchemas.checkIn), asyncHandler(checkIn));
router.post('/check-out', validate(attendanceSchemas.checkOut), asyncHandler(checkOut));
router.get('/my-attendance', asyncHandler(getMyAttendance));
router.get('/today', asyncHandler(getTodayAttendance));

router.get('/config', asyncHandler(getAttendanceConfig));

// HR/Manager/Admin routes
router.get('/all', isManagerOrHROrAdmin, asyncHandler(getAllAttendance));
router.get('/stats', isManagerOrHROrAdmin, asyncHandler(getAttendanceStats));
router.get('/employee/:userId', isManagerOrHROrAdmin, asyncHandler(getEmployeeAttendance));
router.post('/manual', isHROrAdmin, validate(attendanceSchemas.create), asyncHandler(createManualAttendance));

export default router;
