import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true
    },
    favoriteRestaurants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    totalOrders: {
        type: Number,
        default: 0
    },
    totalSpent: {
        type: Number,
        default: 0
    },
    lastOrderDate: Date,
    preferences: {
        dietary: [String],
        cuisineTypes: [String]
    },
    loyaltyPoints: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

export default mongoose.model('Customer', CustomerSchema);
