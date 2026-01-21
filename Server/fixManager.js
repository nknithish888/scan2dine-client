import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Staff from './models/Staff.js';

dotenv.config();

const fixManagerData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // 1. Get all restaurant owners
        const owners = await User.find({ role: 'restaurant_owner' });
        console.log(`Found ${owners.length} restaurant owners.`);

        if (owners.length === 0) {
            console.log('No owners found. Make sure you have created at least one restaurant.');
            process.exit(0);
        }

        // We'll take the first owner to link the existing manager to
        // In a real scenario, you'd want to match emails/names, 
        // but for a fix script we'll link the manager to the first available restaurant.
        const firstOwner = owners[0];
        console.log(`Linking managers to restaurant: ${firstOwner.restaurantName} (${firstOwner._id})`);

        // 2. Find managers that are missing restaurantId
        const managers = await User.find({
            role: 'manager',
            $or: [
                { restaurantId: { $exists: false } },
                { restaurantId: null }
            ]
        });

        console.log(`Found ${managers.length} managers needing data fix.`);

        for (const manager of managers) {
            manager.restaurantId = firstOwner._id;
            manager.restaurantName = firstOwner.restaurantName;
            await manager.save();
            console.log(`Updated User Manager: ${manager.email}`);
        }

        // 3. Optional: Sync Staff collection if needed
        // (The Staff collection already has restaurantId, but let's make sure things match)
        const staffManagers = await Staff.find({ role: 'manager' });
        for (const sm of staffManagers) {
            console.log(`Checking Staff Manager record: ${sm.email}`);
        }

        console.log('Data fix complete!');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing manager data:', error);
        process.exit(1);
    }
};

fixManagerData();
