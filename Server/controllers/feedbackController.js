import Feedback from '../models/Feedback.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import MenuItem, { getMenuModel } from '../models/MenuItem.js';
import logger from '../utils/logger.js';
import QRCode from 'qrcode';
import { sendFeedbackThankYouEmail, sendNewsletterEmail } from '../utils/email.js';

// Generate Feedback QR (Restaurant Owner)
export const generateFeedbackQR = async (req, res) => {
    try {
        const { baseUrl } = req.query;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Auto-generate and save slug if missing
        if (!user.restaurantSlug && user.restaurantName) {
            user.restaurantSlug = user.restaurantName
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
            await user.save();
        }

        const restaurantSlug = user.restaurantSlug;
        const finalBaseUrl = baseUrl || process.env.CLIENT_URL || 'http://localhost:5173';
        const feedbackUrl = `${finalBaseUrl}/feedback/${restaurantSlug}`;

        const qrCodeDataUrl = await QRCode.toDataURL(feedbackUrl, {
            width: 800,
            margin: 2,
            color: {
                dark: '#f97316', // Orange color for feedback
                light: '#FFFFFF'
            }
        });

        res.status(200).json({
            success: true,
            data: {
                qrCode: qrCodeDataUrl,
                feedbackUrl
            }
        });
    } catch (error) {
        logger.error('Error generating feedback QR: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Submit feedback (Customer)
export const submitFeedback = async (req, res) => {
    try {
        const { restaurantSlug, rating, comment, customerName } = req.body;

        // Try direct slug match first
        let restaurant = await User.findOne({ restaurantSlug: restaurantSlug.toLowerCase() });

        if (!restaurant) {
            // Fallback: More flexible matching
            const searchPattern = restaurantSlug.split('-').join('[\\s-]?');
            restaurant = await User.findOne({
                restaurantName: { $regex: new RegExp(`^${searchPattern}$`, 'i') }
            });

            if (!restaurant) {
                const allRestaurants = await User.find({ role: 'restaurant_owner' });
                restaurant = allRestaurants.find(r => {
                    const rSlug = r.restaurantName?.toLowerCase().replace(/[^\w]/g, '');
                    const targetSlug = restaurantSlug.replace(/[^\w]/g, '');
                    return rSlug === targetSlug || (r.restaurantSlug && r.restaurantSlug === restaurantSlug);
                });
            }
        }

        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }

        // Handle uploaded images
        const imagePaths = [];
        if (req.files && req.files.length > 0) {
            req.files.forEach(file => {
                imagePaths.push(`/uploads/feedback/${file.filename}`);
            });
        }

        const feedback = await Feedback.create({
            restaurantId: restaurant._id,
            rating,
            comment,
            customerName: customerName || 'Anonymous',
            customerEmail: req.body.customerEmail,
            images: imagePaths
        });

        // Send thank you email if email is provided
        if (req.body.customerEmail) {
            try {
                // Get top 3 selling dishes for this restaurant
                const topStats = await Order.aggregate([
                    {
                        $match: {
                            restaurantId: restaurant._id,
                            paymentStatus: 'paid'
                        }
                    },
                    { $unwind: '$items' },
                    {
                        $group: {
                            _id: '$items.name',
                            totalQuantity: { $sum: '$items.quantity' }
                        }
                    },
                    { $sort: { totalQuantity: -1 } },
                    { $limit: 3 }
                ]);

                // Fetch full details (images) for these top items from the menu
                const RestaurantMenu = getMenuModel(restaurant.restaurantName);
                const itemNames = topStats.map(stat => stat._id);
                const itemsWithDetails = await RestaurantMenu.find({
                    name: { $in: itemNames }
                }).select('name image');

                // Map stats to include images
                const topItems = topStats.map(stat => {
                    const detail = itemsWithDetails.find(d => d.name === stat._id);
                    return {
                        name: stat._id,
                        image: detail?.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500'
                    };
                });

                await sendFeedbackThankYouEmail(
                    req.body.customerEmail,
                    customerName || 'Valued Guest',
                    restaurant.restaurantName,
                    topItems
                );
            } catch (emailError) {
                logger.error('Error sending feedback thank you email: %o', emailError);
                // Don't fail the request if email fails
            }
        }

        res.status(201).json({ success: true, data: feedback });
    } catch (error) {
        logger.error('Error submitting feedback: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get unique feedback emails for newsletter (Restaurant Owner)
export const getFeedbackEmails = async (req, res) => {
    try {
        const restaurantId = req.user.restaurantId || req.user._id;

        const emails = await Feedback.distinct('customerEmail', {
            restaurantId,
            customerEmail: { $exists: true, $ne: null, $ne: '' }
        });

        res.status(200).json({ success: true, count: emails.length, data: emails });
    } catch (error) {
        logger.error('Error getting feedback emails: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Send Newsletter (Restaurant Owner)
export const sendNewsletter = async (req, res) => {
    try {
        const { subject, content } = req.body;
        const restaurantId = req.user.restaurantId || req.user._id;
        const user = await User.findById(req.user.id);

        if (!subject || !content) {
            return res.status(400).json({ success: false, message: 'Subject and content are required' });
        }

        const emails = await Feedback.distinct('customerEmail', {
            restaurantId,
            customerEmail: { $exists: true, $ne: null, $ne: '' }
        });

        if (emails.length === 0) {
            return res.status(400).json({ success: false, message: 'No customer emails found to send newsletter.' });
        }

        await sendNewsletterEmail(emails, subject, content, user.restaurantName);

        res.status(200).json({ success: true, message: `Newsletter sent successfully to ${emails.length} customers.` });
    } catch (error) {
        logger.error('Error sending newsletter: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get all feedback for a restaurant (Restaurant Owner)
export const getRestaurantFeedback = async (req, res) => {
    try {
        const restaurantId = req.user.restaurantId || req.user._id;

        const feedback = await Feedback.find({ restaurantId })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: feedback });
    } catch (error) {
        logger.error('Error getting feedback: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Get restaurant info by slug (Public)
export const getRestaurantInfoBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        // Try direct slug match first
        let restaurant = await User.findOne({ restaurantSlug: slug.toLowerCase() })
            .select('restaurantName restaurantSlug');

        if (!restaurant) {
            // Fallback: More flexible matching
            // 1. Try simple regex with reconstructed spaces
            const searchPattern = slug.split('-').join('[\\s-]?');
            restaurant = await User.findOne({
                restaurantName: { $regex: new RegExp(`^${searchPattern}$`, 'i') }
            }).select('restaurantName restaurantSlug');

            // 2. If still not found, search all and filter (for smaller sets)
            if (!restaurant) {
                const allRestaurants = await User.find({ role: 'restaurant_owner' }).select('restaurantName restaurantSlug');
                restaurant = allRestaurants.find(r => {
                    const rSlug = r.restaurantName?.toLowerCase().replace(/[^\w]/g, '');
                    const targetSlug = slug.replace(/[^\w]/g, '');
                    return rSlug === targetSlug || (r.restaurantSlug && r.restaurantSlug === slug);
                });
            }
        }

        if (!restaurant) {
            return res.status(404).json({ success: false, message: 'Restaurant not found' });
        }

        res.status(200).json({ success: true, data: restaurant });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
