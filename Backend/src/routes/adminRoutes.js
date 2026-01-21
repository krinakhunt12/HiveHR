/**
 * Admin Routes
 */
import express from 'express';
import { getAdminStats } from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(authenticate);
router.use(authorize(ROLES.COMPANY_ADMIN, ROLES.SUPER_ADMIN));

router.get('/stats', getAdminStats);

export default router;
