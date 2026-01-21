/**
 * Misc Routes
 */
import express from 'express';
import { getAppConfig, getLandingPageData } from '../controllers/miscController.js';

const router = express.Router();

// Public config & landing data
router.get('/config', getAppConfig);
router.get('/landing-page', getLandingPageData);
router.get('/holidays', getHolidays);

export default router;
