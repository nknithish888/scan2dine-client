import mongoose from 'mongoose';

const TableSchema = new mongoose.Schema({
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
    qrCode: {
        type: String,
        required: true
    },
    menuUrl: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    capacity: {
        type: Number,
        default: 4
    }
}, {
    timestamps: true
});

// Ensure unique table number per restaurant
TableSchema.index({ restaurantId: 1, tableNumber: 1 }, { unique: true });

export default mongoose.model('Table', TableSchema);
