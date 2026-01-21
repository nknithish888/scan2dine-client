import Customer from '../models/Customer.js';
import logger from '../utils/logger.js';

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private (SuperAdmin)
export const getCustomers = async (req, res) => {
    try {
        const customers = await Customer.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: customers.length,
            data: customers
        });
    } catch (error) {
        logger.error('Error fetching customers: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Add new customer
// @route   POST /api/customers
// @access  Public
export const addCustomer = async (req, res) => {
    try {
        const { name, email, phone, preferences } = req.body;

        const customer = await Customer.create({
            name,
            email,
            phone,
            preferences
        });

        logger.info('New customer registered: %s', email);

        res.status(201).json({
            success: true,
            data: customer
        });
    } catch (error) {
        logger.error('Error adding customer: %o', error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: 'Email already exists' });
        }
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
export const updateCustomer = async (req, res) => {
    try {
        let customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: customer });
    } catch (error) {
        logger.error('Error updating customer: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private (SuperAdmin)
export const deleteCustomer = async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);

        if (!customer) {
            return res.status(404).json({ success: false, message: 'Customer not found' });
        }

        await customer.deleteOne();

        res.status(200).json({ success: true, message: 'Customer deleted' });
    } catch (error) {
        logger.error('Error deleting customer: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get customer statistics
// @route   GET /api/customers/stats
// @access  Private (SuperAdmin)
export const getCustomerStats = async (req, res) => {
    try {
        const totalCustomers = await Customer.countDocuments();
        const activeCustomers = await Customer.countDocuments({ totalOrders: { $gte: 1 } });
        const totalRevenue = await Customer.aggregate([
            { $group: { _id: null, total: { $sum: '$totalSpent' } } }
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalCustomers,
                activeCustomers,
                totalRevenue: totalRevenue[0]?.total || 0
            }
        });
    } catch (error) {
        logger.error('Error fetching customer stats: %o', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
