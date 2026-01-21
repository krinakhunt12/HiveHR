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
    getAttendanceStats
} from '../controllers/attendanceController.js';
import { authenticate, isHROrAdmin } from '../middleware/auth.js';
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

// HR/Admin routes
router.get('/all', isHROrAdmin, asyncHandler(getAllAttendance));
router.get('/stats', isHROrAdmin, asyncHandler(getAttendanceStats));
router.get('/employee/:userId', isHROrAdmin, asyncHandler(getEmployeeAttendance));
router.post('/manual', isHROrAdmin, validate(attendanceSchemas.create), asyncHandler(createManualAttendance));

export default router;
