import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Staff from '../models/Staff.js';
import logger from '../utils/logger.js';
import { sendStaffCredentialsEmail } from '../utils/email.js';

// @desc    Get all staff for a restaurant
// @route   GET /api/staff
// @access  Private (Restaurant Owner)
export const getStaff = async (req, res) => {
    try {
        const staff = await Staff.find({ restaurantId: req.user.id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: staff.length,
            data: staff
        });
    } catch (error) {
        logger.error('Error fetching staff: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Add new staff member
// @route   POST /api/staff
// @access  Private (Restaurant Owner)
export const addStaff = async (req, res) => {
    try {
        const { name, email, phone, role, shift, salary, address, emergencyContact, password } = req.body;

        // If it's a manager or password is provided, create a portal user
        if (role === 'manager' || password) {
            if (!password) {
                return res.status(400).json({ success: false, message: 'Password is required for Managers' });
            }

            const userExists = await User.findOne({ email });
            if (userExists) {
                return res.status(400).json({ success: false, message: 'A user with this email already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            await User.create({
                email,
                password: hashedPassword,
                rawPassword: password, // Store raw password for superadmin view
                role: 'manager',
                restaurantName: req.user.restaurantName,
                ownerName: name,
                restaurantId: req.user._id // Link manager to this restaurant owner
            });

            // Send Email
            await sendStaffCredentialsEmail(email, password, name, req.user.restaurantName, role);
        }

        const staff = await Staff.create({
            restaurantId: req.user.id,
            restaurantName: req.user.restaurantName,
            name,
            email,
            phone,
            role,
            shift,
            salary,
            address,
            emergencyContact
        });

        logger.info('New staff member added to %s: %s', req.user.restaurantName, name);

        res.status(201).json({
            success: true,
            data: staff
        });
    } catch (error) {
        logger.error('Error adding staff: %o', error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update staff member
// @route   PUT /api/staff/:id
// @access  Private (Restaurant Owner)
export const updateStaff = async (req, res) => {
    try {
        let staff = await Staff.findById(req.params.id);

        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff member not found' });
        }

        // Check if staff belongs to this restaurant
        if (staff.restaurantId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        staff = await Staff.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: staff });
    } catch (error) {
        logger.error('Error updating staff: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete staff member
// @route   DELETE /api/staff/:id
// @access  Private (Restaurant Owner)
export const deleteStaff = async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id);

        if (!staff) {
            return res.status(404).json({ success: false, message: 'Staff member not found' });
        }

        // Check if staff belongs to this restaurant
        if (staff.restaurantId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await staff.deleteOne();

        res.status(200).json({ success: true, message: 'Staff member removed' });
    } catch (error) {
        logger.error('Error deleting staff: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all managers for a restaurant owner
// @route   GET /api/staff/managers
// @access  Private (Restaurant Owner)
export const getManagers = async (req, res) => {
    try {
        const managers = await User.find({
            restaurantId: req.user.id,
            role: 'manager'
        }).select('-password');

        res.status(200).json({
            success: true,
            data: managers
        });
    } catch (error) {
        logger.error('Error fetching managers: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Toggle manager active status
// @route   PATCH /api/staff/managers/:id/toggle-status
// @access  Private (Restaurant Owner)
export const toggleManagerStatus = async (req, res) => {
    try {
        const manager = await User.findOne({
            _id: req.params.id,
            restaurantId: req.user.id,
            role: 'manager'
        });

        if (!manager) {
            return res.status(404).json({ success: false, message: 'Manager not found' });
        }

        manager.isActive = !manager.isActive;
        await manager.save();

        res.status(200).json({
            success: true,
            message: `Manager ${manager.isActive ? 'activated' : 'deactivated'} successfully`,
            data: manager
        });
    } catch (error) {
        logger.error('Error toggling manager status: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
