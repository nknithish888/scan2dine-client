import express from 'express';
import {
    getStaff,
    addStaff,
    updateStaff,
    deleteStaff,
    getManagers,
    toggleManagerStatus
} from '../controllers/staffController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All staff routes are protected for restaurant owners
router.use(protect);

router.route('/')
    .get(getStaff)
    .post(addStaff);

router.route('/:id')
    .put(updateStaff)
    .delete(deleteStaff);

router.get('/managers', getManagers);
router.patch('/managers/:id/toggle-status', toggleManagerStatus);

export default router;
