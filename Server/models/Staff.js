import mongoose from 'mongoose';

const StaffSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    restaurantName: {
        type: String,
        required: true
    },
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
    role: {
        type: String,
        enum: ['waiter', 'chef', 'manager', 'cashier'],
        required: true
    },
    shift: {
        type: String,
        enum: ['morning', 'afternoon', 'evening', 'night'],
        required: true
    },
    salary: {
        type: Number,
        required: true
    },
    joinedDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'on-leave'],
        default: 'active'
    },
    address: String,
    emergencyContact: String
}, {
    timestamps: true
});

export default mongoose.model('Staff', StaffSchema);
