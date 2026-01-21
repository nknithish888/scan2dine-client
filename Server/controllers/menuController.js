import { getMenuModel } from '../models/MenuItem.js';
import logger from '../utils/logger.js';

// @desc    Add new menu item to restaurant's specific collection
// @route   POST /api/menu
// @access  Private (Restaurant Owner)
export const addMenuItem = async (req, res) => {
    try {
        const { name, description, price, category, isVegetarian, isCombo, isAvailable } = req.body;
        let comboItems = req.body.comboItems;

        // If comboItems is sent via FormData it might be a string
        if (typeof comboItems === 'string') {
            try {
                comboItems = JSON.parse(comboItems);
            } catch (e) {
                comboItems = comboItems.split(',').map(item => item.trim());
            }
        }

        // Get dynamic model for this specific restaurant
        const MenuItem = getMenuModel(req.user.restaurantName);

        // Handle image path
        let imagePath = req.body.image; // Default to provided URL if any
        if (req.file) {
            imagePath = `/uploads/menu-items/${req.file.filename}`;
        }

        const menuItem = await MenuItem.create({
            restaurantOwner: req.user.id,
            name,
            description,
            price: Number(price),
            category,
            image: imagePath,
            isVegetarian: isVegetarian === 'true' || isVegetarian === true,
            isCombo: isCombo === 'true' || isCombo === true,
            isAvailable: isAvailable === 'true' || isAvailable === true,
            comboItems: Array.isArray(comboItems) ? comboItems : []
        });

        logger.info('New menu item added to %s collection: %s', req.user.restaurantName, name);

        res.status(201).json({
            success: true,
            data: menuItem
        });
    } catch (error) {
        logger.error('Error adding menu item: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all menu items from restaurant's specific collection
// @route   GET /api/menu
// @access  Private (Restaurant Owner)
export const getMyMenu = async (req, res) => {
    try {
        const MenuItem = getMenuModel(req.user.restaurantName);
        const menu = await MenuItem.find({ restaurantOwner: req.user.id }).sort({ category: 1 });

        // Construct full URLs for images if they are relative paths
        const menuWithUrls = menu.map(item => {
            const itemObj = item.toObject();
            if (itemObj.image && itemObj.image.startsWith('/uploads')) {
                itemObj.image = `${req.protocol}://${req.get('host')}${itemObj.image}`;
            }
            return itemObj;
        });

        res.status(200).json({
            success: true,
            count: menu.length,
            data: menuWithUrls
        });
    } catch (error) {
        logger.error('Error fetching restaurant menu: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update menu item in restaurant's specific collection
// @route   PUT /api/menu/:id
// @access  Private (Restaurant Owner)
export const updateMenuItem = async (req, res) => {
    try {
        const MenuItem = getMenuModel(req.user.restaurantName);
        let menuItem = await MenuItem.findById(req.params.id);

        if (!menuItem) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        const updateData = { ...req.body };

        // Handle types from FormData
        if (updateData.price) updateData.price = Number(updateData.price);
        if (updateData.isVegetarian !== undefined) updateData.isVegetarian = updateData.isVegetarian === 'true' || updateData.isVegetarian === true;
        if (updateData.isCombo !== undefined) updateData.isCombo = updateData.isCombo === 'true' || updateData.isCombo === true;
        if (updateData.isAvailable !== undefined) updateData.isAvailable = updateData.isAvailable === 'true' || updateData.isAvailable === true;

        if (typeof updateData.comboItems === 'string') {
            try {
                updateData.comboItems = JSON.parse(updateData.comboItems);
            } catch (e) {
                updateData.comboItems = updateData.comboItems.split(',').map(item => item.trim());
            }
        }

        if (req.file) {
            updateData.image = `/uploads/menu-items/${req.file.filename}`;
        }

        menuItem = await MenuItem.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        // Add full URL if needed
        const updatedItem = menuItem.toObject();
        if (updatedItem.image && updatedItem.image.startsWith('/uploads')) {
            updatedItem.image = `${req.protocol}://${req.get('host')}${updatedItem.image}`;
        }

        res.status(200).json({ success: true, data: updatedItem });
    } catch (error) {
        logger.error('Error updating menu item: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete menu item from restaurant's specific collection
// @route   DELETE /api/menu/:id
// @access  Private (Restaurant Owner)
export const deleteMenuItem = async (req, res) => {
    try {
        const MenuItem = getMenuModel(req.user.restaurantName);
        const menuItem = await MenuItem.findById(req.params.id);

        if (!menuItem) {
            return res.status(404).json({ success: false, message: 'Item not found' });
        }

        await menuItem.deleteOne();

        res.status(200).json({ success: true, message: 'Item removed' });
    } catch (error) {
        logger.error('Error deleting menu item: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get public menu by restaurant name (for QR code scanning)
// @route   GET /api/menu/public/:restaurantSlug
// @access  Public
export const getPublicMenu = async (req, res) => {
    try {
        const { restaurantSlug } = req.params;

        // Convert slug back to restaurant name (replace hyphens with spaces, capitalize)
        const restaurantName = restaurantSlug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        const MenuItem = getMenuModel(restaurantName);

        // Get only available items
        const menuItems = await MenuItem.find({ isAvailable: true }).sort({ category: 1, name: 1 });

        res.status(200).json({
            success: true,
            restaurantName,
            count: menuItems.length,
            data: menuItems
        });
    } catch (error) {
        logger.error('Error fetching public menu: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
