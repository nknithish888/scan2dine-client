import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            // If not active, block access except for superadmins
            if (req.user.role !== 'superadmin' && !req.user.isActive) {
                return res.status(403).json({
                    success: false,
                    message: 'Account Inactive. Please pay the due amount to access the dashboard functions.',
                    isInactive: true
                });
            }

            // Check for overdue subscription (Block if unpaid and due date has passed)
            if (req.user.role !== 'superadmin' &&
                req.user.paymentStatus === 'unpaid' &&
                req.user.dueDate &&
                new Date(req.user.dueDate) < new Date()) {
                return res.status(403).json({
                    success: false,
                    message: 'Subscription Expired. Please paid or contact Gen-Z ITHUB to unlock dashboard.',
                    isOverdue: true
                });
            }

            next();
        } catch (error) {
            logger.error('Token verification failed: %o', error);
            res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

export const superAdminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'superadmin') {
        next();
    } else {
        logger.warn('Unauthorized access attempt by user: %s', req.user ? req.user.email : 'unknown');
        res.status(403).json({ success: false, message: 'Not authorized as superadmin' });
    }
};
