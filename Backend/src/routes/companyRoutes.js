/**
 * Company Routes
 */
import express from 'express';
import { registerCompany, getMyCompany } from '../controllers/companyController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

// Public registration
router.post('/register', registerCompany);

// Private company info
router.get('/me', authenticate, authorize(ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN), getMyCompany);

export default router;
