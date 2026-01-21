import express from 'express';
import { getProfitReport, getExpenseBreakdown, getTopSellingItems } from '../controllers/reportController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected - requires authentication
router.get('/profit', protect, getProfitReport);
router.get('/expense-breakdown', protect, getExpenseBreakdown);
router.get('/top-items', protect, getTopSellingItems);

export default router;
