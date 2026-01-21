import express from 'express';
import {
    login,
    createRestaurantOwner,
    getAllRestaurants,
    getRestaurantDetails,
    updatePaymentStatus,
    updateDueDate,
    toggleRestaurantStatus,
    deleteRestaurant,
    getRestaurantProducts,
    getRestaurantStaff,
    getRestaurantAnalytics,
    updateRestaurantPassword,
    updateRestaurantPlan
} from '../controllers/authController.js';
import { protect, superAdminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/superadmin/add-restaurant', protect, superAdminOnly, createRestaurantOwner);
router.get('/superadmin/restaurants', protect, superAdminOnly, getAllRestaurants);
router.get('/superadmin/restaurants/:id', protect, superAdminOnly, getRestaurantDetails);
router.patch('/superadmin/restaurants/:id/payment', protect, superAdminOnly, updatePaymentStatus);
router.patch('/superadmin/restaurants/:id/due-date', protect, superAdminOnly, updateDueDate);
router.patch('/superadmin/restaurants/:id/toggle-status', protect, superAdminOnly, toggleRestaurantStatus);
router.delete('/superadmin/restaurants/:id', protect, superAdminOnly, deleteRestaurant);

// New features for restaurant details
router.get('/superadmin/restaurants/:id/products', protect, superAdminOnly, getRestaurantProducts);
router.get('/superadmin/restaurants/:id/staff', protect, superAdminOnly, getRestaurantStaff);
router.get('/superadmin/restaurants/:id/analytics', protect, superAdminOnly, getRestaurantAnalytics);
router.patch('/superadmin/restaurants/password/:id', protect, superAdminOnly, updateRestaurantPassword);
router.patch('/superadmin/restaurants/:id/plan', protect, superAdminOnly, updateRestaurantPlan);



export default router;

