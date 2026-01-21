import express from 'express';
import {
    submitFeedback,
    getRestaurantFeedback,
    getRestaurantInfoBySlug,
    generateFeedbackQR,
    getFeedbackEmails,
    sendNewsletter
} from '../controllers/feedbackController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/submit', upload.array('images', 5), submitFeedback);
router.get('/info/:slug', getRestaurantInfoBySlug);
router.get('/generate-qr', protect, generateFeedbackQR);
router.get('/all', protect, getRestaurantFeedback);
router.get('/emails', protect, getFeedbackEmails);
router.post('/newsletter/send', protect, sendNewsletter);

export default router;
