import Order from '../models/Order.js';
import Expense from '../models/Expense.js';
import logger from '../utils/logger.js';

// Get profit report (weekly, monthly, yearly)
export const getProfitReport = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        const restaurantId = req.user.restaurantId || req.user.id;

        const now = new Date();
        let startDate;
        let groupByFormat;
        let dateLabels = [];

        // Get restaurant creation date to ensure we don't show data before they were added
        const User = (await import('../models/User.js')).default;
        const restaurantUser = await User.findById(req.user.restaurantId || req.user._id);
        const restaurantCreatedAt = restaurantUser ? new Date(restaurantUser.createdAt) : new Date(0);

        // Determine date range and grouping based on period
        switch (period) {
            case 'weekly':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                // Don't show data before restaurant was created
                if (startDate < restaurantCreatedAt) {
                    startDate = new Date(restaurantCreatedAt);
                }
                groupByFormat = '%Y-%m-%d';
                // Generate labels from max(7 days ago, creation date) to today
                const daysToShow = Math.min(7, Math.ceil((now - startDate) / (1000 * 60 * 60 * 24)));
                for (let i = daysToShow - 1; i >= 0; i--) {
                    const date = new Date(now);
                    date.setDate(now.getDate() - i);
                    if (date >= restaurantCreatedAt) {
                        dateLabels.push(date.toISOString().split('T')[0]);
                    }
                }
                break;

            case 'monthly':
                startDate = new Date(now);
                startDate.setDate(1); // First day of current month
                // Don't show data before restaurant was created
                if (startDate < restaurantCreatedAt) {
                    startDate = new Date(restaurantCreatedAt);
                }
                groupByFormat = '%Y-%m-%d';
                // Generate days from max(first of month, creation date) to today
                const currentDate = new Date(startDate);
                while (currentDate <= now) {
                    if (currentDate >= restaurantCreatedAt) {
                        dateLabels.push(currentDate.toISOString().split('T')[0]);
                    }
                    currentDate.setDate(currentDate.getDate() + 1);
                }
                break;

            case 'yearly':
                startDate = new Date(now.getFullYear(), 0, 1); // First day of current year
                // Don't show data before restaurant was created
                if (startDate < restaurantCreatedAt) {
                    startDate = new Date(restaurantCreatedAt);
                }
                groupByFormat = '%Y-%m';
                // Generate months from max(first of year, creation date) to now
                const startMonth = startDate.getMonth();
                const startYear = startDate.getFullYear();
                const currentMonth = now.getMonth();
                const currentYear = now.getFullYear();

                for (let year = startYear; year <= currentYear; year++) {
                    const monthStart = (year === startYear) ? startMonth : 0;
                    const monthEnd = (year === currentYear) ? currentMonth : 11;
                    for (let month = monthStart; month <= monthEnd; month++) {
                        const date = new Date(year, month, 1);
                        if (date >= restaurantCreatedAt) {
                            const monthStr = date.toISOString().substring(0, 7);
                            dateLabels.push(monthStr);
                        }
                    }
                }
                break;

            default:
                return res.status(400).json({ success: false, message: 'Invalid period. Use: weekly, monthly, or yearly' });
        }

        // Aggregate revenue from paid orders (only after restaurant creation)
        const revenueData = await Order.aggregate([
            {
                $match: {
                    restaurantId: req.user.restaurantId || req.user._id,
                    paymentStatus: 'paid',
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: groupByFormat, date: '$createdAt' } },
                    revenue: { $sum: '$totalAmount' },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Aggregate expenses (only after restaurant creation)
        const expenseData = await Expense.aggregate([
            {
                $match: {
                    restaurantId: req.user.restaurantId || req.user._id,
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: groupByFormat, date: '$date' } },
                    expenses: { $sum: '$amount' },
                    expenseCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Create lookup maps for quick access
        const revenueMap = {};
        revenueData.forEach(item => {
            revenueMap[item._id] = {
                revenue: item.revenue,
                orderCount: item.orderCount
            };
        });

        const expenseMap = {};
        expenseData.forEach(item => {
            expenseMap[item._id] = {
                expenses: item.expenses,
                expenseCount: item.expenseCount
            };
        });

        // Generate complete timeline with all dates
        const timeline = dateLabels.map(dateLabel => {
            const revenue = revenueMap[dateLabel]?.revenue || 0;
            const expenses = expenseMap[dateLabel]?.expenses || 0;
            const profit = revenue - expenses;

            return {
                date: dateLabel,
                revenue: Math.round(revenue * 100) / 100,
                expenses: Math.round(expenses * 100) / 100,
                profit: Math.round(profit * 100) / 100,
                orderCount: revenueMap[dateLabel]?.orderCount || 0,
                expenseCount: expenseMap[dateLabel]?.expenseCount || 0
            };
        });

        // Calculate summary totals
        const summary = {
            totalRevenue: Math.round(timeline.reduce((sum, day) => sum + day.revenue, 0) * 100) / 100,
            totalExpenses: Math.round(timeline.reduce((sum, day) => sum + day.expenses, 0) * 100) / 100,
            totalProfit: 0,
            totalOrders: timeline.reduce((sum, day) => sum + day.orderCount, 0),
            totalExpenseRecords: timeline.reduce((sum, day) => sum + day.expenseCount, 0),
            profitMargin: 0,
            period: period
        };

        summary.totalProfit = Math.round((summary.totalRevenue - summary.totalExpenses) * 100) / 100;
        summary.profitMargin = summary.totalRevenue > 0
            ? Math.round((summary.totalProfit / summary.totalRevenue) * 100 * 100) / 100
            : 0;

        logger.info('Profit report generated for restaurant: %s, period: %s', req.user.restaurantName || req.user.email, period);

        res.status(200).json({
            success: true,
            data: {
                timeline,
                summary,
                period
            }
        });

    } catch (error) {
        logger.error('Error generating profit report: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get expense breakdown by category
export const getExpenseBreakdown = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        const restaurantId = req.user.restaurantId || req.user.id;

        const now = new Date();
        let startDate;

        // Get restaurant creation date
        const User = (await import('../models/User.js')).default;
        const restaurantUser = await User.findById(req.user.restaurantId || req.user._id);
        const restaurantCreatedAt = restaurantUser ? new Date(restaurantUser.createdAt) : new Date(0);

        switch (period) {
            case 'weekly':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                break;
            case 'monthly':
                startDate = new Date(now);
                startDate.setDate(1);
                break;
            case 'yearly':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now);
                startDate.setDate(1);
        }

        // Don't show data before restaurant was created
        if (startDate < restaurantCreatedAt) {
            startDate = new Date(restaurantCreatedAt);
        }

        const categoryBreakdown = await Expense.aggregate([
            {
                $match: {
                    restaurantId: req.user.restaurantId || req.user._id,
                    date: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$category',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { totalAmount: -1 } }
        ]);

        const formattedBreakdown = categoryBreakdown.map(item => ({
            category: item._id,
            amount: Math.round(item.totalAmount * 100) / 100,
            count: item.count,
            percentage: 0
        }));

        const totalExpenses = formattedBreakdown.reduce((sum, item) => sum + item.amount, 0);
        formattedBreakdown.forEach(item => {
            item.percentage = totalExpenses > 0
                ? Math.round((item.amount / totalExpenses) * 100 * 100) / 100
                : 0;
        });

        res.status(200).json({
            success: true,
            data: {
                breakdown: formattedBreakdown,
                totalExpenses: Math.round(totalExpenses * 100) / 100,
                period
            }
        });

    } catch (error) {
        logger.error('Error generating expense breakdown: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
// Get top selling items
export const getTopSellingItems = async (req, res) => {
    try {
        const { period = 'monthly' } = req.query;
        const restaurantId = req.user.restaurantId || req.user._id;

        const now = new Date();
        let startDate;

        switch (period) {
            case 'weekly':
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 7);
                break;
            case 'monthly':
                startDate = new Date(now);
                startDate.setDate(1);
                break;
            case 'yearly':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                startDate = new Date(now);
                startDate.setDate(1);
        }

        const topItems = await Order.aggregate([
            {
                $match: {
                    restaurantId: restaurantId,
                    paymentStatus: 'paid',
                    createdAt: { $gte: startDate }
                }
            },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.name',
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
                    isCombo: { $first: '$items.isCombo' }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 10 }
        ]);

        res.status(200).json({
            success: true,
            data: {
                topItems,
                period
            }
        });

    } catch (error) {
        logger.error('Error generating top selling items report: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
