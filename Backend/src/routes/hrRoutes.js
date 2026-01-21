/**
 * HR Routes
 */
import express from 'express';
import { getHRStats } from '../controllers/hrController.js';
import { authenticate, isHROrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);
router.use(isHROrAdmin);

router.get('/stats', getHRStats);

export default router;
