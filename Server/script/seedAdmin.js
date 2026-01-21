import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const adminEmail = process.env.SUPERADMIN_EMAIL || 'admin@scan2dine.com';
        const existingAdmin = await User.findOne({ email: adminEmail });

        if (existingAdmin) {
            console.log('Super Admin already exists');
            process.exit(0);
        }

        const hashedPassword = await bcrypt.hash('adminpassword', 10);

        const admin = new User({
            email: adminEmail,
            password: hashedPassword,
            role: 'superadmin',
            ownerName: 'Platform Admin'
        });

        await admin.save();
        console.log('Super Admin created successfully');
        console.log('Email:', adminEmail);
        console.log('Password: adminpassword');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
