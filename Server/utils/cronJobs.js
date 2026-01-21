import cron from 'node-cron';
import User from '../models/User.js';
import { sendDueDateReminderEmail, sendDueDateWarningEmail } from './email.js';
import logger from './logger.js';

export const initCronJobs = () => {
    // Run every day at 09:00 AM
    cron.schedule('0 9 * * *', async () => {
        logger.info('Running Daily Subscription Check Cron Job');
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Find all restaurants that are unpaid
            const unpaidRestaurants = await User.find({
                role: 'restaurant_owner',
                paymentStatus: 'unpaid',
                dueDate: { $ne: null }
            });

            for (const restaurant of unpaidRestaurants) {
                const dueDate = new Date(restaurant.dueDate);
                dueDate.setHours(0, 0, 0, 0);

                const timeDiff = dueDate.getTime() - today.getTime();
                const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

                // If due date is within 5 days (1 to 5)
                if (daysDiff > 0 && daysDiff <= 5) {
                    logger.info(`Sending reminder to ${restaurant.restaurantName} (${daysDiff} days left)`);
                    await sendDueDateReminderEmail(
                        restaurant.email,
                        restaurant.ownerName,
                        restaurant.restaurantName,
                        restaurant.dueDate,
                        daysDiff
                    );
                }
                // If due date has passed or is today
                else if (daysDiff <= 0) {
                    logger.warn(`Sending warning to ${restaurant.restaurantName} (Overdue by ${Math.abs(daysDiff)} days)`);
                    await sendDueDateWarningEmail(
                        restaurant.email,
                        restaurant.ownerName,
                        restaurant.restaurantName
                    );
                }
            }
        } catch (error) {
            logger.error('Error in Subscription Cron Job: %o', error);
        }
    });

    logger.info('Cron Jobs Initialized');
};
