import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    restaurantName: {
        type: String,
        required: true
    },
    tableNumber: {
        type: String,
        required: true
    },
    customerName: {
        type: String,
        default: 'Guest'
    },
    items: [{
        menuItemId: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        isCombo: {
            type: Boolean,
            default: false
        },
        comboItems: [String],
        specialInstructions: String
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'preparing', 'ready', 'served', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'upi', 'wallet'],
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid'],
        default: 'unpaid'
    },
    orderNotes: String
}, {
    timestamps: true
});

export default mongoose.model('Order', OrderSchema);
