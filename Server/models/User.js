import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    rawPassword: {
        type: String,
    },
    role: {
        type: String,
        enum: ['superadmin', 'restaurant_owner', 'manager'],
        default: 'restaurant_owner',
    },
    restaurantName: String,
    restaurantSlug: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true
    },
    ownerName: String,
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    plan: {
        type: String,
        enum: ['Starter', 'Pro', 'Enterprise'],
        default: 'Starter',
    },
    paymentStatus: {
        type: String,
        enum: ['paid', 'unpaid'],
        default: 'unpaid',
    },
    lastPayment: {
        type: Date,
        default: null,
    },
    dueDate: {
        type: Date,
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    billingHistory: [{
        date: { type: Date, default: Date.now },
        plan: String,
        status: String,
        dueDate: Date,
        amount: Number,
        notes: String
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Generate slug before saving
userSchema.pre('save', function (next) {
    if (this.isModified('restaurantName') && this.restaurantName) {
        this.restaurantSlug = this.restaurantName
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Remove special chars
            .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with hyphens
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    }
    next();
});

const User = mongoose.model('User', userSchema);
export default User;
