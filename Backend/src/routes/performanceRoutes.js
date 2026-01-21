/**
 * Performance Routes
 */
import express from 'express';
import { getMyReviews, getTeamReviews, createReview } from '../controllers/performanceController.js';
import { authenticate, isManagerOrHROrAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/my-reviews', getMyReviews);
router.get('/team-reviews', isManagerOrHROrAdmin, getTeamReviews);
router.post('/', isManagerOrHROrAdmin, createReview);

export default router;
