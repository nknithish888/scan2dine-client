import express from 'express';
import {
    getCustomers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerStats
} from '../controllers/customerController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

//Public route for customer registration
router.post('/', addCustomer);

// Protected routes for superadmin
router.get('/', protect, getCustomers);
router.get('/stats', protect, getCustomerStats);
router.put('/:id', protect, updateCustomer);
router.delete('/:id', protect, deleteCustomer);

export default router;
