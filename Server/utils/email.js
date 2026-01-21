import nodemailer from 'nodemailer';
import logger from './logger.js';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOnboardingEmail = async (email, password, ownerName, restaurantName, plan) => {
  const mailOptions = {
    from: `"Scan2Dine" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Welcome to Scan2Dine - ${restaurantName}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 15px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #FF6B35; margin-bottom: 5px;">Scan2Dine</h1>
          <p style="color: #666; font-size: 1.1rem;">Digital QR Menu Platform</p>
        </div>
        
        <h2 style="color: #333;">Welcome, ${ownerName}!</h2>
        <p style="color: #555; line-height: 1.6;">
          Congratulations! Your restaurant, <strong>${restaurantName}</strong>, has been successfully onboarded to the Scan2Dine platform.
        </p>
        
        <div style="background-color: #fff8f5; border-left: 4px solid #FF6B35; padding: 20px; margin: 25px 0; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #FF6B35;">Your Credentials</h3>
          <p style="margin-bottom: 10px;"><strong>Email:</strong> ${email}</p>
          <p style="margin-bottom: 10px;"><strong>Default Password:</strong> <span style="background: #eee; padding: 2px 6px; border-radius: 4px;">${password}</span></p>
          <p style="margin-bottom: 0;"><strong>Active Plan:</strong> <span style="color: #4CAF50; font-weight: bold;">${plan}</span></p>
        </div>
        
        <p style="color: #555; line-height: 1.6;">
          You can now login to your dashboard and start creating your digital menu. We recommend changing your password after your first login.
        </p>
        
        <div style="text-align: center; margin-top: 40px;">
          <a href="http://localhost:5173" style="background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); color: white; padding: 15px 35px; text-decoration: none; font-weight: bold; border-radius: 50px; display: inline-block;">Login to Dashboard</a>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin-top: 40px;" />
        <p style="color: #999; font-size: 0.8rem; text-align: center;">
          © 2025 Scan2Dine. All rights reserved. <br/>
          This is an automated message, please do not reply.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('Onboarding email sent successfully: %s', info.messageId);
    return true;
  } catch (error) {
    logger.error('Failed to send onboarding email: %o', error);
    return false;
  }
};

export const sendStaffCredentialsEmail = async (email, password, staffName, restaurantName, role) => {
  const mailOptions = {
    from: `"Scan2Dine" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Login Credentials for ${restaurantName}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 15px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #FF6B35; margin-bottom: 5px;">Scan2Dine</h1>
          <p style="color: #666; font-size: 1.1rem;">Restaurant Management Platform</p>
        </div>
        
        <h2 style="color: #333;">Hello, ${staffName}!</h2>
        <p style="color: #555; line-height: 1.6;">
          You have been added as a <strong>${role}</strong> for <strong>${restaurantName}</strong> on the Scan2Dine platform.
        </p>
        
        <div style="background-color: #fff8f5; border-left: 4px solid #FF6B35; padding: 20px; margin: 25px 0; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #FF6B35;">Your Access Details</h3>
          <p style="margin-bottom: 10px;"><strong>Login Email:</strong> ${email}</p>
          <p style="margin-bottom: 10px;"><strong>Password:</strong> <span style="background: #eee; padding: 2px 6px; border-radius: 4px;">${password}</span></p>
          <p style="margin-bottom: 0;"><strong>Role:</strong> <span style="color: #FF6B35; font-weight: bold; text-transform: capitalize;">${role}</span></p>
        </div>
        
        <p style="color: #555; line-height: 1.6;">
          You can use these credentials to access the restaurant management dashboard.
        </p>
        
        <div style="text-align: center; margin-top: 40px;">
          <a href="http://localhost:5173" style="background: linear-gradient(135deg, #FF6B35 0%, #FF8C42 100%); color: white; padding: 15px 35px; text-decoration: none; font-weight: bold; border-radius: 50px; display: inline-block;">Login to Dashboard</a>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin-top: 40px;" />
        <p style="color: #999; font-size: 0.8rem; text-align: center;">
          © 2025 Scan2Dine. All rights reserved. <br/>
          This is an automated message, please do not reply.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('Staff credentials email sent successfully: %s', info.messageId);
    return true;
  } catch (error) {
    logger.error('Failed to send staff credentials email: %o', error);
    return false;
  }
};

export const sendDueDateUpdateEmail = async (email, ownerName, restaurantName, dueDate) => {
  const formattedDate = new Date(dueDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const mailOptions = {
    from: `"Gen-Z ITHUB Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Subscription Due Date Updated - ${restaurantName}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 15px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #FF6B35; margin-bottom: 5px;">Gen-Z ITHUB</h1>
          <p style="color: #666; font-size: 1.1rem;">Digital Excellence & Support</p>
        </div>
        
        <h2 style="color: #333;">Hello ${ownerName}!</h2>
        <p style="color: #555; line-height: 1.6;">
          This is to inform you that the subscription due date for <strong>${restaurantName}</strong> has been updated by the administrator.
        </p>
        
        <div style="background-color: #f0f7ff; border-left: 4px solid #007bff; padding: 20px; margin: 25px 0; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #007bff;">New Payment Due Date</h3>
          <p style="font-size: 1.5rem; font-weight: bold; margin: 10px 0; color: #333;">${formattedDate}</p>
          <p style="margin-bottom: 0; font-size: 0.9rem; color: #666;">Please ensure payment is made on or before this date to avoid service interruption.</p>
        </div>
        
        <p style="color: #555; line-height: 1.6;">
          You can check your payment status and due date anytime in your dashboard.
        </p>
        
        <div style="text-align: center; margin-top: 40px;">
          <a href="http://localhost:5173" style="background: #333; color: white; padding: 15px 35px; text-decoration: none; font-weight: bold; border-radius: 50px; display: inline-block;">View Dashboard</a>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin-top: 40px;" />
        <p style="color: #999; font-size: 0.8rem; text-align: center;">
          © 2025 Gen-Z ITHUB. All rights reserved. <br/>
          Empowering your business through digital innovation.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('Due date update email sent: %s', info.messageId);
    return true;
  } catch (error) {
    logger.error('Failed to send due date update email: %o', error);
    return false;
  }
};

export const sendDueDateReminderEmail = async (email, ownerName, restaurantName, dueDate, daysRemaining) => {
  const formattedDate = new Date(dueDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const mailOptions = {
    from: `"Gen-Z ITHUB Billing" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Friendly Reminder: Payment Due in ${daysRemaining} Days - ${restaurantName}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 15px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #FF6B35; margin-bottom: 5px;">Gen-Z ITHUB</h1>
        </div>
        
        <h2 style="color: #333;">Payment Reminder</h2>
        <p style="color: #555; line-height: 1.6;">
          Hello ${ownerName}, this is a friendly reminder that the subscription payment for <strong>${restaurantName}</strong> is due in <strong>${daysRemaining} days</strong>.
        </p>
        
        <div style="background-color: #fff8f5; border-left: 4px solid #FF6B35; padding: 20px; margin: 25px 0; border-radius: 8px;">
          <p style="margin: 0;"><strong>Due Date:</strong> ${formattedDate}</p>
        </div>
        
        <p style="color: #555; line-height: 1.6;">
          To ensure continued access to your dashboard and services, please make the payment at your earliest convenience.
        </p>
        
        <div style="text-align: center; margin-top: 40px;">
          <a href="http://localhost:5173" style="background: #FF6B35; color: white; padding: 15px 35px; text-decoration: none; font-weight: bold; border-radius: 50px; display: inline-block;">Make Payment</a>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('Due date reminder email sent to %s', email);
    return true;
  } catch (error) {
    logger.error('Failed to send reminder email: %o', error);
    return false;
  }
};

export const sendDueDateWarningEmail = async (email, ownerName, restaurantName) => {
  const mailOptions = {
    from: `"Gen-Z ITHUB Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `URGENT: Payment Overdue - Action Required for ${restaurantName}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ffebeb; border-radius: 15px; background-color: #fff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #d32f2f; margin-bottom: 5px;">Gen-Z ITHUB</h1>
          <p style="color: #666; font-size: 1.1rem;">Urgent Notice</p>
        </div>
        
        <h2 style="color: #d32f2f;">Your account is overdue!</h2>
        <p style="color: #333; line-height: 1.6; font-weight: bold;">
          Hello ${ownerName},
        </p>
        <p style="color: #555; line-height: 1.6;">
          The subscription for <strong>${restaurantName}</strong> has expired. We have not received your payment.
        </p>
        
        <div style="background-color: #fff1f1; border: 2px solid #d32f2f; padding: 25px; margin: 25px 0; border-radius: 12px; color: #d32f2f;">
          <p style="font-size: 1.1rem; margin: 0; line-height: 1.6;">
            <strong>Warning:</strong> Please pay the amount or else your dashboard will be blocked. You will not be able to access the dashboard or any Scan2Dine services.
          </p>
          <p style="margin-top: 15px; font-style: italic;">
            "We value our partnership, but an unpaid balance will break our professional relationship between <strong>${restaurantName}</strong> and <strong>Gen-Z ITHUB</strong>."
          </p>
        </div>
        
        <p style="color: #555; line-height: 1.6;">
          To avoid account suspension and maintain our beautiful relationship, please settle the dues immediately.
        </p>
        
        <div style="text-align: center; margin-top: 40px;">
          <a href="http://localhost:5173" style="background: #d32f2f; color: white; padding: 18px 40px; text-decoration: none; font-weight: bold; border-radius: 50px; display: inline-block; box-shadow: 0 4px 12px rgba(211,47,47,0.3);">Pay Now to Restore Access</a>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin-top: 40px;" />
        <p style="color: #999; font-size: 0.8rem; text-align: center;">
          © 2025 Gen-Z ITHUB. All rights reserved. <br/>
          This is an urgent automated notification.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('Warning email sent to %s', email);
    return true;
  } catch (error) {
    logger.error('Failed to send warning email: %o', error);
    return false;
  }
};

export const sendPlanUpdateEmail = async (email, ownerName, restaurantName, plan, amount) => {
  const mailOptions = {
    from: `"Gen-Z ITHUB Billing" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Subscription Plan Updated - ${restaurantName}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 15px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #FF6B35; margin-bottom: 5px;">Gen-Z ITHUB</h1>
          <p style="color: #666; font-size: 1.1rem;">Payment Confirmation</p>
        </div>
        
        <h2 style="color: #333;">Subscription Updated!</h2>
        <p style="color: #555; line-height: 1.6;">
          Hello ${ownerName}, your subscription plan for <strong>${restaurantName}</strong> has been successfully updated by the administrator.
        </p>
        
        <div style="background-color: #f8f9fa; border: 1px solid #e9ecef; border-radius: 12px; padding: 25px; margin: 25px 0;">
          <h3 style="margin-top: 0; color: #333; border-bottom: 1px solid #dee2e6; padding-bottom: 10px;">Payment Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; color: #666;">New Plan:</td>
              <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #FF6B35;">${plan}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666;">Amount Paid:</td>
              <td style="padding: 10px 0; text-align: right; font-weight: bold; color: #333;">₹${amount}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666;">Payment Status:</td>
              <td style="padding: 10px 0; text-align: right; color: #28a745; font-weight: bold;">PAID</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666;">Transaction Date:</td>
              <td style="padding: 10px 0; text-align: right; color: #333;">${new Date().toLocaleDateString('en-GB')}</td>
            </tr>
          </table>
        </div>
        
        <p style="color: #555; line-height: 1.6;">
          Thank you for choosing Scan2Dine. Your dashboard features have been updated according to your new plan.
        </p>
        
        <div style="text-align: center; margin-top: 40px;">
          <a href="http://localhost:5173" style="background: #FF6B35; color: white; padding: 15px 35px; text-decoration: none; font-weight: bold; border-radius: 50px; display: inline-block;">Go to Dashboard</a>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin-top: 40px;" />
        <p style="color: #999; font-size: 0.8rem; text-align: center;">
          © 2025 Gen-Z ITHUB. All rights reserved. <br/>
          Empowering your business through digital innovation.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('Plan update email sent: %s', info.messageId);
    return true;
  } catch (error) {
    logger.error('Failed to send plan update email: %o', error);
    return false;
  }
};

export const sendFeedbackThankYouEmail = async (email, customerName, restaurantName, topItems) => {
  // Helper to ensure image URLs are absolute
  const resolveImageUrl = (img) => {
    if (!img) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500';
    if (img.startsWith('http')) return img;
    const serverUrl = 'http://localhost:3001'; // Fallback to dev port
    return `${serverUrl}${img.startsWith('/') ? '' : '/'}${img}`;
  };

  const mailOptions = {
    from: `"Scan2Dine" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Thanks for your feedback, ${customerName}!`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #FF6B35; margin-bottom: 5px; font-size: 2.5rem; font-weight: 900;">Scan2Dine</h1>
          <p style="color: #666; font-size: 1.1rem; font-weight: 500;">Valuing Your Experience</p>
        </div>
        
        <h2 style="color: #333; font-size: 1.5rem;">Hello ${customerName}!</h2>
        <p style="color: #555; line-height: 1.7; font-size: 1.1rem;">
          Thank you so much for visiting <strong>${restaurantName}</strong> and sharing your feedback. Your voice helps us grow and serve you better!
        </p>
        
        <div style="background-color: #fff8f5; border-left: 5px solid #FF6B35; padding: 30px; margin: 30px 0; border-radius: 15px; font-style: italic; box-shadow: 0 4px 15px rgba(255,107,53,0.05);">
          <p style="color: #333; font-size: 1.2rem; margin: 0; line-height: 1.6;">
            "Good food is the foundation of genuine happiness."
          </p>
          <p style="text-align: right; color: #666; margin-top: 15px; font-size: 1rem; font-weight: bold;">— Auguste Escoffier</p>
        </div>

        <div style="margin-top: 40px;">
          <h3 style="color: #333; text-transform: uppercase; font-size: 0.9rem; letter-spacing: 2px; margin-bottom: 25px; text-align: center; font-weight: 900;">🔥 Most Loved Dishes to try next time</h3>
          <div style="display: grid; gap: 20px;">
            ${topItems.map(item => `
              <div style="background: #ffffff; border: 1px solid #f0f0f0; padding: 15px; border-radius: 20px; display: flex; align-items: center; gap: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.02);">
                <div style="width: 80px; height: 80px; border-radius: 15px; overflow: hidden; flex-shrink: 0;">
                  <img src="${resolveImageUrl(item.image)}" alt="${item.name}" style="width: 100%; height: 100%; object-cover: cover;" />
                </div>
                <div style="flex-grow: 1;">
                  <div style="font-weight: 900; color: #333; font-size: 1.2rem;">${item.name}</div>
                  <div style="color: #FF6B35; font-size: 0.9rem; font-weight: 700;">Customer Favorite</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div style="text-align: center; margin-top: 40px;">
          <p style="color: #555; line-height: 1.6; font-size: 1.1rem; margin-bottom: 25px;">
            We look forward to serving you again soon!
          </p>
          <a href="${process.env.CLIENT_URL}" style="display: inline-block; background: #FF6B35; color: white; padding: 18px 40px; border-radius: 50px; text-decoration: none; font-weight: 900; font-size: 1.1rem; shadow: 0 10px 20px rgba(255,107,53,0.2);">Explore More Dishes</a>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin-top: 50px;" />
        <p style="color: #999; font-size: 0.9rem; text-align: center; line-height: 1.5;">
          © 2025 Scan2Dine. All rights reserved. <br/>
          This is a personalized thank you message from <strong>${restaurantName}</strong>.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('Feedback thank you email sent to %s with images', email);
    return true;
  } catch (error) {
    logger.error('Failed to send feedback thank you email: %o', error);
    return false;
  }
};

export const sendNewsletterEmail = async (emails, subject, content, restaurantName) => {
  const mailOptions = {
    from: `"${restaurantName}" <${process.env.EMAIL_USER}>`,
    to: emails.join(', '),
    subject: subject,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 20px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #FF6B35; margin-bottom: 5px; font-size: 2.5rem; font-weight: 900;">${restaurantName}</h1>
          <p style="color: #666; font-size: 1.1rem; font-weight: 500;">Special Update & Offers</p>
        </div>
        
        <div style="color: #444; line-height: 1.8; font-size: 1.1rem; white-space: pre-wrap;">
          ${content}
        </div>
        
        <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 1rem; margin-bottom: 25px;">
            Visit us today for a delightful experience!
          </p>
          <a href="${process.env.CLIENT_URL}" style="display: inline-block; background: #FF6B35; color: white; padding: 18px 40px; border-radius: 50px; text-decoration: none; font-weight: 900; font-size: 1.1rem;">Order Now</a>
        </div>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin-top: 50px;" />
        <p style="color: #999; font-size: 0.8rem; text-align: center; line-height: 1.5;">
          © 2025 ${restaurantName}. All rights reserved. <br/>
          You are receiving this because you visited us and shared your feedback.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info('Newsletter sent to %d recipients from %s', emails.length, restaurantName);
    return true;
  } catch (error) {
    logger.error('Failed to send newsletter: %o', error);
    return false;
  }
};
