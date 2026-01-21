import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Staff from '../models/Staff.js';
import Order from '../models/Order.js';
import { getMenuModel } from '../models/MenuItem.js';
import logger from '../utils/logger.js';
import {
    sendOnboardingEmail,
    sendDueDateUpdateEmail,
    sendDueDateReminderEmail,
    sendDueDateWarningEmail,
    sendPlanUpdateEmail
} from '../utils/email.js';

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        logger.info('Login attempt for email: %s', email);

        // Find user by email
        const user = await User.findOne({ email });

        if (!user) {
            logger.warn('Login failed: User not found for email: %s', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if account is active
        if (user.role !== 'superadmin' && user.isActive === false) {
            logger.warn('Login failed: Account is deactivated for email: %s', email);
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Please contact support for assistance.'
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            logger.warn('Login failed: Incorrect password for email: %s', email);
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        logger.info('Login successful for email: %s', email);
        return res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                restaurantName: user.restaurantName,
                ownerName: user.ownerName,
                plan: user.plan,
                isActive: user.isActive
            },
            message: 'Logged in successfully'
        });
    } catch (error) {
        logger.error('Login error: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const createRestaurantOwner = async (req, res) => {
    try {
        const { email, password, restaurantName, ownerName, plan } = req.body;

        if (!email || !password || !restaurantName || !ownerName || !plan) {
            return res.status(400).json({ success: false, message: 'Please provide all details' });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            email,
            password: hashedPassword,
            rawPassword: password, // Store raw password for superadmin view
            restaurantName,
            ownerName,
            plan,
            role: 'restaurant_owner'
        });

        logger.info('New restaurant owner created by superadmin: %s', email);

        // Send Onboarding Email
        await sendOnboardingEmail(email, password, ownerName, restaurantName, plan);

        res.status(201).json({
            success: true,
            message: 'Restaurant owner created and email sent successfully',
            user: {
                id: newUser._id,
                email: newUser.email,
                restaurantName: newUser.restaurantName,
                ownerName: newUser.ownerName,
                plan: newUser.plan,
                role: newUser.role
            }
        });
    } catch (error) {
        logger.error('Error creating restaurant owner: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

export const getAllRestaurants = async (req, res) => {
    try {
        const restaurants = await User.find({ role: 'restaurant_owner' }).select('email rawPassword restaurantName ownerName plan paymentStatus isActive createdAt').sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: restaurants.length, restaurants });
    } catch (error) {
        logger.error('Error fetching restaurants: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get single restaurant details
export const getRestaurantDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = await User.findById(id).select('+rawPassword').lean();

        if (restaurant) {
            console.log(`[ACCESS] Superadmin viewing restaurant: ${restaurant.restaurantName}. Raw Password Check: ${restaurant.rawPassword ? 'FOUND' : 'MISSING IN DB'}`);
        }

        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }

        res.status(200).json({ success: true, restaurant });
    } catch (error) {
        logger.error('Error fetching restaurant details: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update payment status
export const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentStatus } = req.body;

        if (!['paid', 'unpaid'].includes(paymentStatus)) {
            return res.status(400).json({ success: false, message: 'Invalid payment status' });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }

        // Restriction: If already PAID and cycle is active (current date <= due date), lock buttons
        if (user.paymentStatus === 'paid' && user.dueDate) {
            const now = new Date();
            const due = new Date(user.dueDate);
            if (now <= due) {
                return res.status(400).json({
                    success: false,
                    message: 'Status is locked until the current billing cycle ends (Due Date reached).'
                });
            }
        }

        const updates = { paymentStatus };

        // If marking as paid, update lastPayment date
        if (paymentStatus === 'paid') {
            updates.lastPayment = new Date();
        }

        const restaurant = await User.findByIdAndUpdate(
            id,
            {
                ...updates,
                $push: {
                    billingHistory: {
                        date: new Date(),
                        status: paymentStatus,
                        notes: `Status changed to ${paymentStatus}`
                    }
                }
            },
            { new: true }
        ).select('-password');

        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }

        logger.info('Payment status updated for restaurant: %s to %s', restaurant.restaurantName, paymentStatus);
        res.status(200).json({ success: true, restaurant, message: 'Payment status updated successfully' });
    } catch (error) {
        logger.error('Error updating payment status: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update due date
export const updateDueDate = async (req, res) => {
    try {
        const { id } = req.params;
        const { dueDate } = req.body;

        if (!dueDate) {
            return res.status(400).json({ success: false, message: 'Due date is required' });
        }

        const restaurant = await User.findByIdAndUpdate(
            id,
            {
                dueDate: new Date(dueDate),
                $push: {
                    billingHistory: {
                        date: new Date(),
                        dueDate: new Date(dueDate),
                        notes: `Due date changed to ${new Date(dueDate).toLocaleDateString()}`
                    }
                }
            },
            { new: true }
        ).select('-password');

        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }

        // Send email notification
        await sendDueDateUpdateEmail(
            restaurant.email,
            restaurant.ownerName,
            restaurant.restaurantName,
            dueDate
        );

        logger.info('Due date updated for restaurant: %s', restaurant.restaurantName);
        res.status(200).json({ success: true, restaurant, message: 'Due date updated successfully and email sent' });
    } catch (error) {
        logger.error('Error updating due date: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Toggle restaurant active/inactive status
export const toggleRestaurantStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const restaurant = await User.findById(id);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }

        const previousStatus = restaurant.isActive;
        restaurant.isActive = !restaurant.isActive;
        await restaurant.save();

        logger.info('Restaurant %s status changed from %s to %s',
            restaurant.restaurantName,
            previousStatus ? 'Active' : 'Inactive',
            restaurant.isActive ? 'Active' : 'Inactive'
        );

        res.status(200).json({
            success: true,
            restaurant: { ...restaurant.toObject(), password: undefined },
            message: `Restaurant ${restaurant.isActive ? 'activated' : 'deactivated'} successfully`
        });
    } catch (error) {
        logger.error('Error toggling restaurant status: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Delete restaurant
export const deleteRestaurant = async (req, res) => {
    try {
        const { id } = req.params;

        const restaurant = await User.findByIdAndDelete(id);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }

        logger.info('Restaurant deleted: %s', restaurant.restaurantName);
        res.status(200).json({ success: true, message: 'Restaurant deleted successfully' });
    } catch (error) {
        logger.error('Error deleting restaurant: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get restaurant products (SuperAdmin)
export const getRestaurantProducts = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = await User.findById(id);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }

        const MenuItem = getMenuModel(restaurant.restaurantName);
        const products = await MenuItem.find({ restaurantOwner: id }).sort({ category: 1 });

        res.status(200).json({ success: true, count: products.length, products });
    } catch (error) {
        logger.error('Error fetching restaurant products: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get restaurant staff (SuperAdmin)
export const getRestaurantStaff = async (req, res) => {
    try {
        const { id } = req.params;
        const staffRaw = await Staff.find({ restaurantId: id }).sort({ createdAt: -1 });

        // Augment staff with portal credentials if they exist
        const staff = await Promise.all(staffRaw.map(async (member) => {
            const memberObj = member.toObject();
            // Check if this staff email has a portal user account
            const userAccount = await User.findOne({ email: member.email }).select('+rawPassword').lean();
            if (userAccount) {
                memberObj.portalPassword = userAccount.rawPassword;
            }
            return memberObj;
        }));

        res.status(200).json({ success: true, count: staff.length, staff });
    } catch (error) {
        logger.error('Error fetching restaurant staff: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get restaurant analytics (SuperAdmin)
export const getRestaurantAnalytics = async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch last 7 days of sales
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const salesData = await Order.aggregate([
            {
                $match: {
                    restaurantId: new mongoose.Types.ObjectId(id),
                    paymentStatus: 'paid',
                    createdAt: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalSales: { $sum: "$totalAmount" },
                    orderCount: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Fill in missing days
        const formattedSalesData = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const dayData = salesData.find(d => d._id === dateStr);
            formattedSalesData.push({
                date: dateStr,
                sales: dayData ? dayData.totalSales : 0,
                orders: dayData ? dayData.orderCount : 0
            });
        }

        res.status(200).json({
            success: true,
            analytics: {
                salesOverTime: formattedSalesData
            }
        });
    } catch (error) {
        logger.error('Error fetching restaurant analytics: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update restaurant/manager password (SuperAdmin Override)
export const updateRestaurantPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 4) {
            return res.status(400).json({ success: false, message: 'Password must be at least 4 characters' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const user = await User.findByIdAndUpdate(id, {
            password: hashedPassword,
            rawPassword: newPassword
        }, { new: true }).select('+rawPassword');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Password updated successfully',
            rawPassword: user.rawPassword
        });
    } catch (error) {
        logger.error('Error updating password: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Update restaurant plan (SuperAdmin)
export const updateRestaurantPlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { plan, amount } = req.body;

        if (!plan || !amount) {
            return res.status(400).json({ success: false, message: 'Plan and amount are required' });
        }

        const restaurant = await User.findById(id);
        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }

        const updatedRestaurant = await User.findByIdAndUpdate(
            id,
            {
                plan,
                paymentStatus: 'paid',
                lastPayment: new Date(),
                $push: {
                    billingHistory: {
                        date: new Date(),
                        plan: plan,
                        status: 'paid',
                        amount: Number(amount),
                        notes: `Plan changed to ${plan} and payment of ₹${amount} received.`
                    }
                }
            },
            { new: true }
        ).select('-password');

        // Send confirmation email
        await sendPlanUpdateEmail(
            updatedRestaurant.email,
            updatedRestaurant.ownerName,
            updatedRestaurant.restaurantName,
            plan,
            amount
        );

        logger.info('Plan updated for restaurant: %s to %s (Amount: %s)',
            updatedRestaurant.restaurantName, plan, amount);

        res.status(200).json({
            success: true,
            restaurant: updatedRestaurant,
            message: 'Plan updated successfully and email sent.'
        });
    } catch (error) {
        logger.error('Error updating restaurant plan: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
