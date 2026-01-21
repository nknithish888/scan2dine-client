import express from 'express';
import {
    getTables,
    createTable,
    updateTable,
    deleteTable
} from '../controllers/tableController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All table routes are protected for restaurant owners
router.use(protect);

router.route('/')
    .get(getTables)
    .post(createTable);

router.route('/:id')
    .put(updateTable)
    .delete(deleteTable);

export default router;
