import Table from '../models/Table.js';
import QRCode from 'qrcode';
import logger from '../utils/logger.js';

// @desc    Get all tables for a restaurant
// @route   GET /api/tables
// @access  Private (Restaurant Owner)
export const getTables = async (req, res) => {
    try {
        const tables = await Table.find({ restaurantId: req.user.id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: tables.length,
            data: tables
        });
    } catch (error) {
        logger.error('Error fetching tables: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Create a new table with QR code
// @route   POST /api/tables
// @access  Private (Restaurant Owner)
export const createTable = async (req, res) => {
    try {
        const { tableNumber, capacity, baseUrl } = req.body;

        // Check if table already exists
        const existingTable = await Table.findOne({
            restaurantId: req.user.id,
            tableNumber
        });

        if (existingTable) {
            return res.status(400).json({
                success: false,
                message: 'Table number already exists'
            });
        }

        // Generate menu URL
        const restaurantSlug = req.user.restaurantName.trim().toLowerCase().replace(/\s+/g, '-');
        const finalBaseUrl = baseUrl || process.env.CLIENT_URL || 'http://localhost:5173';
        const menuUrl = `${finalBaseUrl}/menu/${restaurantSlug}/${tableNumber}`;

        // Generate QR code as Data URL
        const qrCodeDataUrl = await QRCode.toDataURL(menuUrl, {
            width: 600,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        // Create table
        const table = await Table.create({
            restaurantId: req.user.id,
            restaurantName: req.user.restaurantName,
            tableNumber,
            qrCode: qrCodeDataUrl,
            menuUrl,
            capacity: capacity || 4
        });

        logger.info('New table created for %s: Table %s', req.user.restaurantName, tableNumber);

        res.status(201).json({
            success: true,
            data: table
        });
    } catch (error) {
        logger.error('Error creating table: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update table
// @route   PUT /api/tables/:id
// @access  Private (Restaurant Owner)
export const updateTable = async (req, res) => {
    try {
        let table = await Table.findById(req.params.id);

        if (!table) {
            return res.status(404).json({ success: false, message: 'Table not found' });
        }

        // Check if table belongs to this restaurant
        if (table.restaurantId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Only allow updating status and capacity, not QR code
        const { status, capacity } = req.body;
        const updateData = {};
        if (status) updateData.status = status;
        if (capacity) updateData.capacity = capacity;

        table = await Table.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({ success: true, data: table });
    } catch (error) {
        logger.error('Error updating table: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete table
// @route   DELETE /api/tables/:id
// @access  Private (Restaurant Owner)
export const deleteTable = async (req, res) => {
    try {
        const table = await Table.findById(req.params.id);

        if (!table) {
            return res.status(404).json({ success: false, message: 'Table not found' });
        }

        // Check if table belongs to this restaurant
        if (table.restaurantId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await table.deleteOne();

        res.status(200).json({ success: true, message: 'Table deleted' });
    } catch (error) {
        logger.error('Error deleting table: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
