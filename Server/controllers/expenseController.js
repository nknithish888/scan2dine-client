import Expense from '../models/Expense.js';
import logger from '../utils/logger.js';

// @desc    Get all expenses for a restaurant
// @route   GET /api/expenses
// @access  Private (Restaurant Owner/Manager)
export const getExpenses = async (req, res) => {
    try {
        const restaurantId = req.user.role === 'manager' ? req.user.restaurantId : req.user._id;
        const expenses = await Expense.find({ restaurantId }).sort({ date: -1 });

        res.status(200).json({
            success: true,
            count: expenses.length,
            data: expenses
        });
    } catch (error) {
        logger.error('Error fetching expenses: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Add new expense
// @route   POST /api/expenses
// @access  Private (Restaurant Owner/Manager)
export const addExpense = async (req, res) => {
    try {
        const { title, amount, category, date, description, paymentMethod } = req.body;
        const restaurantId = req.user.role === 'manager' ? req.user.restaurantId : req.user._id;

        const expense = await Expense.create({
            restaurantId,
            title,
            amount,
            category,
            date: date || Date.now(),
            description,
            paymentMethod,
            addedBy: req.user._id
        });

        res.status(201).json({
            success: true,
            data: expense
        });
    } catch (error) {
        logger.error('Error adding expense: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private (Restaurant Owner/Manager)
export const updateExpense = async (req, res) => {
    try {
        const restaurantId = req.user.role === 'manager' ? req.user.restaurantId : req.user._id;
        let expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }

        if (expense.restaurantId.toString() !== restaurantId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: expense });
    } catch (error) {
        logger.error('Error updating expense: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private (Restaurant Owner/Manager)
export const deleteExpense = async (req, res) => {
    try {
        const restaurantId = req.user.role === 'manager' ? req.user.restaurantId : req.user._id;
        const expense = await Expense.findById(req.params.id);

        if (!expense) {
            return res.status(404).json({ success: false, message: 'Expense not found' });
        }

        if (expense.restaurantId.toString() !== restaurantId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await expense.deleteOne();

        res.status(200).json({ success: true, message: 'Expense removed' });
    } catch (error) {
        logger.error('Error deleting expense: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
