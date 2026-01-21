import mongoose from 'mongoose';
import Order from '../models/Order.js';
import logger from '../utils/logger.js';

// Helper to get restaurant ID based on user role
const getTargetRestaurantId = (user) => {
    return user.role === 'manager' ? user.restaurantId : user._id;
};

// @desc    Get all orders for a restaurant
// @route   GET /api/orders
// @access  Private (Restaurant Owner/Manager)
export const getOrders = async (req, res) => {
    try {
        const targetId = getTargetRestaurantId(req.user);
        const orders = await Order.find({ restaurantId: targetId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        logger.error('Error fetching orders: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get live/active orders for a restaurant
// @route   GET /api/orders/live
// @access  Private (Restaurant Owner/Manager)
export const getLiveOrders = async (req, res) => {
    try {
        const targetId = getTargetRestaurantId(req.user);
        const orders = await Order.find({
            restaurantId: targetId,
            status: { $in: ['pending', 'preparing', 'ready'] }
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (error) {
        logger.error('Error fetching live orders: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Public (from QR code scan)
export const createOrder = async (req, res) => {
    try {
        const {
            restaurantId,
            restaurantName,
            tableNumber,
            customerName,
            items,
            totalAmount,
            paymentMethod,
            orderNotes
        } = req.body;

        const order = await Order.create({
            restaurantId,
            restaurantName,
            tableNumber,
            customerName: customerName || 'Guest',
            items,
            totalAmount,
            paymentMethod,
            orderNotes
        });

        logger.info('New order created for %s: Table %s', restaurantName, tableNumber);

        // Notify via Socket.IO
        const io = req.app.get('io');
        if (io) {
            io.emit('new_order', order);
        }

        res.status(201).json({
            success: true,
            data: order
        });
    } catch (error) {
        logger.error('Error creating order: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private (Restaurant Owner)
export const updateOrderStatus = async (req, res) => {
    try {
        const { status, paymentStatus } = req.body;

        let order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const targetId = getTargetRestaurantId(req.user);
        // Check if order belongs to this restaurant
        if (order.restaurantId.toString() !== targetId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const updateData = { ...req.body };

        order = await Order.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        // Notify via Socket.IO
        const io = req.app.get('io');
        if (io) {
            io.emit('order_update', order);
        }

        res.status(200).json({ success: true, data: order });
    } catch (error) {
        logger.error('Error updating order: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete/cancel an order
// @route   DELETE /api/orders/:id
// @access  Private (Restaurant Owner)
export const deleteOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const targetId = getTargetRestaurantId(req.user);
        // Check if order belongs to this restaurant
        if (order.restaurantId.toString() !== targetId.toString()) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await order.deleteOne();

        res.status(200).json({ success: true, message: 'Order deleted' });
    } catch (error) {
        logger.error('Error deleting order: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

import Expense from '../models/Expense.js';

// @desc    Get order statistics
// @route   GET /api/orders/stats
// @access  Private (Restaurant Owner)
export const getOrderStats = async (req, res) => {
    try {
        const targetId = getTargetRestaurantId(req.user);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const last7Days = new Date();
        last7Days.setDate(last7Days.getDate() - 7);
        last7Days.setHours(0, 0, 0, 0);

        const [
            todayOrders,
            totalOrders,
            totalRevenue,
            todayRevenue,
            statusBreakdown,
            salesHistory,
            totalExpenses,
            todayExpenses,
            expenseHistory,
            todayRevBreakdown,
            todayExpBreakdown
        ] = await Promise.all([
            Order.countDocuments({ restaurantId: targetId, createdAt: { $gte: today } }),
            Order.countDocuments({ restaurantId: targetId }),
            Order.aggregate([
                { $match: { restaurantId: targetId, status: { $ne: 'cancelled' } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            Order.aggregate([
                { $match: { restaurantId: targetId, createdAt: { $gte: today }, status: { $ne: 'cancelled' } } },
                { $group: { _id: null, total: { $sum: '$totalAmount' } } }
            ]),
            Order.aggregate([
                { $match: { restaurantId: targetId } },
                { $group: { _id: '$status', count: { $sum: 1 } } }
            ]),
            Order.aggregate([
                { $match: { restaurantId: targetId, createdAt: { $gte: last7Days }, status: { $ne: 'cancelled' } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        total: { $sum: "$totalAmount" },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id": 1 } }
            ]),
            Expense.aggregate([
                { $match: { restaurantId: targetId } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Expense.aggregate([
                { $match: { restaurantId: targetId, date: { $gte: today } } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Expense.aggregate([
                { $match: { restaurantId: targetId, date: { $gte: last7Days } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                        total: { $sum: "$amount" }
                    }
                },
                { $sort: { "_id": 1 } }
            ]),
            // Cash vs Bank breakdown for Today's Revenue
            Order.aggregate([
                { $match: { restaurantId: targetId, createdAt: { $gte: today }, status: { $ne: 'cancelled' }, paymentStatus: 'paid' } },
                {
                    $group: {
                        _id: null,
                        cash: { $sum: { $cond: [{ $eq: ["$paymentMethod", "cash"] }, "$totalAmount", 0] } },
                        bank: { $sum: { $cond: [{ $ne: ["$paymentMethod", "cash"] }, "$totalAmount", 0] } }
                    }
                }
            ]),
            // Cash vs Bank breakdown for Today's Expenses
            Expense.aggregate([
                { $match: { restaurantId: targetId, date: { $gte: today } } },
                {
                    $group: {
                        _id: null,
                        cash: { $sum: { $cond: [{ $eq: ["$paymentMethod", "cash"] }, "$amount", 0] } },
                        bank: { $sum: { $cond: [{ $ne: ["$paymentMethod", "cash"] }, "$amount", 0] } }
                    }
                }
            ])
        ]);

        const cashRev = todayRevBreakdown[0]?.cash || 0;
        const bankRev = todayRevBreakdown[0]?.bank || 0;
        const cashExp = todayExpBreakdown[0]?.cash || 0;
        const bankExp = todayExpBreakdown[0]?.bank || 0;

        res.status(200).json({
            success: true,
            data: {
                todayOrders,
                totalOrders,
                totalRevenue: totalRevenue[0]?.total || 0,
                todayRevenue: todayRevenue[0]?.total || 0,
                totalExpenses: totalExpenses[0]?.total || 0,
                todayExpenses: todayExpenses[0]?.total || 0,
                cashInHand: cashRev - cashExp,
                bankBalance: bankRev - bankExp,
                statusBreakdown,
                salesHistory,
                expenseHistory
            }
        });
    } catch (error) {
        logger.error('Error fetching order stats: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
