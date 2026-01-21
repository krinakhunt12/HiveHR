/**
 * Employee Routes
 */

import express from 'express';
import {
    getAllEmployees,
    getEmployeeById,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeStats
} from '../controllers/employeeController.js';
import { authenticate, isHROrAdmin, isSelfOrAdmin } from '../middleware/auth.js';
import { validate, employeeSchemas } from '../middleware/validator.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all employees (HR/Admin only)
router.get('/', isHROrAdmin, asyncHandler(getAllEmployees));

// Create employee (HR/Admin only)
router.post('/', isHROrAdmin, validate(employeeSchemas.create), asyncHandler(createEmployee));

// Get employee by ID (Self or HR/Admin)
router.get('/:id', asyncHandler(getEmployeeById));

// Update employee (HR/Admin only)
router.put('/:id', isHROrAdmin, validate(employeeSchemas.update), asyncHandler(updateEmployee));

// Delete employee (HR/Admin only)
router.delete('/:id', isHROrAdmin, asyncHandler(deleteEmployee));

// Get employee stats (Self or HR/Admin)
router.get('/:id/stats', asyncHandler(getEmployeeStats));

export default router;
