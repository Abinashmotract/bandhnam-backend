import nodemailer from "nodemailer";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { sendEmail } from "../utils/sendEmail.js";

// Email worker configuration
const transporter = nodemailer.createTransporter({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "kumarsinha2574@gmail.com",
    pass: process.env.EMAIL_PASS || "tsod jopw zhbe qklp",
  },
});

// Process email notifications
export const processEmailNotifications = async () => {
  try {
    console.log("Processing email notifications...");

    // Get pending email notifications
    const notifications = await Notification.find({
      emailSent: false,
      type: { $in: ["like", "superlike", "match", "message", "verification", "system"] }
    }).populate("user", "name email");

    for (const notification of notifications) {
      try {
        await sendNotificationEmail(notification);
        
        // Mark as sent
        notification.emailSent = true;
        notification.emailSentAt = new Date();
        await notification.save();

        console.log(`Email sent for notification ${notification._id}`);
      } catch (error) {
        console.error(`Error sending email for notification ${notification._id}:`, error);
      }
    }

    console.log(`Processed ${notifications.length} email notifications`);
  } catch (error) {
    console.error("Error processing email notifications:", error);
  }
};

// Send notification email
const sendNotificationEmail = async (notification) => {
  const { user, type, title, message, data } = notification;

  if (!user || !user.email) {
    throw new Error("User email not found");
  }

  let emailSubject = title;
  let emailHtml = "";

  switch (type) {
    case "like":
      emailSubject = "Someone liked your profile!";
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #51365F;">Someone liked your profile!</h2>
          <p>Hello ${user.name},</p>
          <p>Great news! Someone liked your profile on Bandhanam Nammatch.</p>
          <p>Log in to see who it was and start a conversation!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/login" 
               style="background-color: #51365F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Profile
            </a>
          </div>
          <p>Best regards,<br>Bandhanam Nammatch Team</p>
        </div>
      `;
      break;

    case "superlike":
      emailSubject = "Someone super liked your profile!";
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #51365F;">Someone super liked your profile!</h2>
          <p>Hello ${user.name},</p>
          <p>Amazing! Someone super liked your profile on Bandhanam Nammatch.</p>
          <p>This is special - log in to see who it was!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/login" 
               style="background-color: #51365F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Profile
            </a>
          </div>
          <p>Best regards,<br>Bandhanam Nammatch Team</p>
        </div>
      `;
      break;

    case "match":
      emailSubject = "It's a Match!";
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #51365F;">It's a Match! 🎉</h2>
          <p>Hello ${user.name},</p>
          <p>Congratulations! You have a new match on Bandhanam Nammatch.</p>
          <p>You both liked each other - time to start a conversation!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/matches" 
               style="background-color: #51365F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Match
            </a>
          </div>
          <p>Best regards,<br>Bandhanam Nammatch Team</p>
        </div>
      `;
      break;

    case "message":
      emailSubject = "New Message";
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #51365F;">New Message</h2>
          <p>Hello ${user.name},</p>
          <p>You have received a new message on Bandhanam Nammatch.</p>
          <p>Log in to read and reply!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/messages" 
               style="background-color: #51365F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Messages
            </a>
          </div>
          <p>Best regards,<br>Bandhanam Nammatch Team</p>
        </div>
      `;
      break;

    case "verification":
      emailSubject = "Verification Update";
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #51365F;">Verification Update</h2>
          <p>Hello ${user.name},</p>
          <p>${message}</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/profile" 
               style="background-color: #51365F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Profile
            </a>
          </div>
          <p>Best regards,<br>Bandhanam Nammatch Team</p>
        </div>
      `;
      break;

    case "system":
      emailSubject = title;
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #51365F;">${title}</h2>
          <p>Hello ${user.name},</p>
          <p>${message}</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}" 
               style="background-color: #51365F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Visit Site
            </a>
          </div>
          <p>Best regards,<br>Bandhanam Nammatch Team</p>
        </div>
      `;
      break;

    default:
      emailSubject = title;
      emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #51365F;">${title}</h2>
          <p>Hello ${user.name},</p>
          <p>${message}</p>
          <p>Best regards,<br>Bandhanam Nammatch Team</p>
        </div>
      `;
  }

  await sendEmail(user.email, emailSubject, emailHtml);
};

// Process welcome emails for new users
export const processWelcomeEmails = async () => {
  try {
    console.log("Processing welcome emails...");

    // Get users who haven't received welcome email
    const users = await User.find({
      role: "user",
      welcomeEmailSent: { $ne: true }
    }).limit(50); // Process in batches

    for (const user of users) {
      try {
        await sendWelcomeEmail(user);
        
        // Mark welcome email as sent
        user.welcomeEmailSent = true;
        await user.save();

        console.log(`Welcome email sent to ${user.email}`);
      } catch (error) {
        console.error(`Error sending welcome email to ${user.email}:`, error);
      }
    }

    console.log(`Processed ${users.length} welcome emails`);
  } catch (error) {
    console.error("Error processing welcome emails:", error);
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  const { name, email, profileFor, gender } = user;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #51365F;">Welcome to Bandhanam Nammatch!</h2>
      <p>Hello ${name},</p>
      <p>Thank you for registering with Bandhanam Nammatch - your journey to find the perfect partner begins now!</p>
      <p><strong>Your registration details:</strong></p>
      <ul>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Profile For:</strong> ${profileFor}</li>
        ${gender ? `<li><strong>Gender:</strong> ${gender}</li>` : ""}
      </ul>
      <p>We're excited to help you find your perfect match. Complete your profile to get started!</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/profile" 
           style="background-color: #51365F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Complete Profile
        </a>
      </div>
      <p>Best regards,<br>Bandhanam Nammatch Team</p>
    </div>
  `;

  await sendEmail(email, "Welcome to Bandhanam Nammatch!", html);
};

// Process password reset emails
export const processPasswordResetEmails = async () => {
  try {
    console.log("Processing password reset emails...");

    // Get users with pending password reset
    const users = await User.find({
      passwordResetToken: { $exists: true },
      passwordResetExpiry: { $gt: new Date() },
      passwordResetEmailSent: { $ne: true }
    });

    for (const user of users) {
      try {
        await sendPasswordResetEmail(user);
        
        // Mark email as sent
        user.passwordResetEmailSent = true;
        await user.save();

        console.log(`Password reset email sent to ${user.email}`);
      } catch (error) {
        console.error(`Error sending password reset email to ${user.email}:`, error);
      }
    }

    console.log(`Processed ${users.length} password reset emails`);
  } catch (error) {
    console.error("Error processing password reset emails:", error);
  }
};

// Send password reset email
const sendPasswordResetEmail = async (user) => {
  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password?token=${user.passwordResetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #51365F;">Password Reset Request</h2>
      <p>Hello ${user.name},</p>
      <p>You requested to reset your password. Click the button below to reset it:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #51365F; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p>Or copy and paste this link in your browser:</p>
      <p style="word-break: break-all; color: #666;">${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this reset, please ignore this email.</p>
      <p>Best regards,<br>Bandhanam Nammatch Team</p>
    </div>
  `;

  await sendEmail(user.email, "Password Reset - Bandhanam Nammatch", html);
};
