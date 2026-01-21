import express from 'express';
import {
    addMenuItem,
    getMyMenu,
    updateMenuItem,
    deleteMenuItem,
    getPublicMenu
} from '../controllers/menuController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public route for QR code menu access (must be before protect middleware)
router.get('/public/:restaurantSlug', getPublicMenu);

// All other menu routes are protected for authenticated restaurant owners
router.use(protect);

router.route('/')
    .get(getMyMenu)
    .post(upload.single('image'), addMenuItem);

router.route('/:id')
    .put(upload.single('image'), updateMenuItem)
    .delete(deleteMenuItem);

export default router;
