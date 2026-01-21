import express from 'express';
import {
    getOrders,
    getLiveOrders,
    createOrder,
    updateOrderStatus,
    deleteOrder,
    getOrderStats
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for creating orders (from QR code)
router.post('/', createOrder);

// Protected routes for restaurant owners
router.use(protect);

router.get('/', getOrders);
router.get('/live', getLiveOrders);
router.get('/stats', getOrderStats);
router.put('/:id', updateOrderStatus);
router.delete('/:id', deleteOrder);

export default router;
