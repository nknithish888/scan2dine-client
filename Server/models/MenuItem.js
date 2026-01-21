import mongoose from 'mongoose';

const MenuItemSchema = new mongoose.Schema({
    restaurantOwner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: [true, 'Please add a dish name'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    price: {
        type: Number,
        required: [true, 'Please add a price']
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        enum: [
            'Breakfast Specials',
            'Dosa & Uttapam',
            'Starters & Appetizers',
            'Main Course Curries',
            'Meals & Thalis',
            'Biryani & Rice Varieties',
            'Breads & Parotta',
            'Desserts & Sweets',
            'Beverages & Coffee',
            'Other'
        ]
    },
    image: {
        type: String,
        default: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60'
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    isVegetarian: {
        type: Boolean,
        default: false
    },
    isCombo: {
        type: Boolean,
        default: false
    },
    savingAmount: {
        type: Number,
        default: 0
    },
    comboItems: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

// Helper function to get a dynamic model based on restaurant name
export const getMenuModel = (restaurantName) => {
    // Sanitize restaurant name to create a valid collection name
    const collectionName = `menu_${restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;

    // Check if model already exists to avoid OverwriteModelError
    if (mongoose.models[collectionName]) {
        return mongoose.models[collectionName];
    }

    return mongoose.model(collectionName, MenuItemSchema, collectionName);
};

export default mongoose.model('MenuItem', MenuItemSchema);
