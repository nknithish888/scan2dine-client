import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
    restaurantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    category: {
        type: String,
        enum: ['Raw Materials', 'Rent', 'Electricity', 'Water', 'Salaries', 'Maintenance', 'Marketing', 'Other'],
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    description: String,
    paymentMethod: {
        type: String,
        enum: ['cash', 'online', 'card'],
        default: 'cash'
    },
    addedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
