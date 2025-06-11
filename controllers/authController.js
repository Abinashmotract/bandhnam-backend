import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { generateAccessToken, generateRefreshToken } from '../utils/generateToken.js';
import sendEmail from '../utils/sendEmail.js';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'kumarsinha2574@gmail.com',
        pass: 'txev hhvo qstw ewij',
    }
});

export const signup = async (req, res) => {
    const { name, email, phoneNumber, password } = req.body;

    // Validate phone number (must be exactly 10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phoneNumber)) {
        return res.status(400).json({
            success: false,
            status: 400,
            message: 'Phone number must be exactly 10 digits.',
        });
    }

    // ✅ Validate password strength
    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    // Explanation:
    // - At least one lowercase letter
    // - At least one uppercase letter
    // - At least one digit
    // - At least one special character
    // - Minimum 8 characters long

    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            success: false,
            status: 400,
            message:
                'Password must be at least 8 characters and include one uppercase letter, one lowercase letter, one number, and one special character.',
        });
    }

    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: 'User already exists',
            });
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, phoneNumber, password: hashed });

        // Send welcome email
        const mailOptions = {
            from: 'Kumarsinha2574@gmail.com',
            to: email,
            subject: 'Welcome to Your App!',
            html: `
                <h2>Hello ${name},</h2>
                <p>Thank you for registering with us.</p>
                <p><strong>Your login details:</strong></p>
                <ul>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Password:</strong> ${password}</li>
                </ul>
                <p>Keep this information secure.</p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending mail:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        return res.status(201).json({
            success: true,
            status: 201,
            message: 'User registered successfully. Welcome email sent.',
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            status: 500,
            message: 'Server error',
            error: err.message,
        });
    }
};

export const login = async (req, res) => {
    const { identifier, password } = req.body;
    try {
        const user = await User.findOne({
            $or: [{ email: identifier }, { phoneNumber: identifier }],
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: identifier.includes('@')
                    ? 'Email not found'
                    : 'Phone number not found'
            });
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({
                success: false,
                message: 'Incorrect password'
            });
        }
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                accessToken,
                refreshToken,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

export const refreshAccessToken = (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({ success: false, message: 'Refresh token required' });
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const accessToken = generateAccessToken(decoded.id);

        res.status(200).json({
            success: true,
            accessToken,
        });
    } catch (err) {
        return res.status(403).json({ success: false, message: 'Invalid or expired refresh token' });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Send OTP via email
        await transporter.sendMail({
            from: 'kumarsinha2574@gmail.com',
            to: email,
            subject: 'Your OTP for Password Reset',
            text: `Your OTP is: ${otp}`,
        });

        res.status(200).json({ success: true, message: 'OTP sent to your email' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};


export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        user.otp = null;
        user.otpExpiry = null;
        user.isOtpVerified = true;
        await user.save();

        res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
};

export const resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // 🔐 Check if OTP was verified
        if (!user.isOtpVerified) {
            return res.status(403).json({
                success: false,
                message: 'OTP not verified. Cannot reset password.',
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Reset OTP and verification status
        user.otp = null;
        user.otpExpiry = null;
        user.isOtpVerified = false; // 🔒 Prevent reuse
        user.password = hashedPassword;

        await user.save();

        // Send confirmation email
        const mailOptions = {
            from: 'kumarsinha2574@gmail.com',
            to: email,
            subject: 'Your Password Has Been Reset',
            html: `
                <h2>Hello ${user.name},</h2>
                <p>Your password has been successfully reset.</p>
                <p><strong>Your updated login details:</strong></p>
                <ul>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>New Password:</strong> ${newPassword}</li>
                </ul>
                <p>If you did not perform this action, please contact support immediately.</p>
                <br />
                <p>Best regards,<br>Your App Team</p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending password reset email:', error);
            } else {
                console.log('Password reset email sent:', info.response);
            }
        });

        res.status(200).json({
            success: true,
            message: 'Password reset successful and confirmation email sent.',
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: err.message,
        });
    }
};

// Get Logged-in User Details by Token
export const getUserDetailsById = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password -otp -otpExpiry -isOtpVerified');

        if (!user) {
            return res.status(404).json({
                success: false,
                statusCode: 404,
                message: 'User not found',
            });
        }

        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'User details fetched successfully',
            user,
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: 'Server error',
            error: err.message,
        });
    }
};
