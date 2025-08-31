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
        pass: 'tsod jopw zhbe qklp',
    }
});

export const signup = async (req, res) => {
    const {
        name,
        email,
        mobile,
        password,
        confirmPassword,
        profileFor,
        gender,
        dob,
        occupation,
        location,
        agreeToTerms
    } = req.body;
    if (!name || !email || !mobile || !password || !profileFor) {
        return res.status(400).json({
            success: false,
            status: 400,
            message: 'All required fields must be provided',
        });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({
            success: false,
            status: 400,
            message: 'Passwords do not match',
        });
    }
    if (!agreeToTerms) {
        return res.status(400).json({
            success: false,
            status: 400,
            message: 'You must agree to the terms and conditions',
        });
    }
    if ((profileFor === 'self' || profileFor === 'relative' || profileFor === 'friend') && !gender) {
        return res.status(400).json({
            success: false,
            status: 400,
            message: 'Gender is required for this profile type',
        });
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(mobile)) {
        return res.status(400).json({
            success: false,
            status: 400,
            message: 'Phone number must be exactly 10 digits.',
        });
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            success: false,
            status: 400,
            message: 'Password must be at least 8 characters and include one uppercase letter, one lowercase letter, one number, and one special character.',
        });
    }
    try {
        const userExists = await User.findOne({
            $or: [{ email }, { phoneNumber: mobile }]
        });

        if (userExists) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: 'User with this email or phone number already exists',
            });
        }

        const hashed = await bcrypt.hash(password, 10);
        let finalGender = gender;
        if (!finalGender) {
            if (profileFor === 'son' || profileFor === 'brother') {
                finalGender = 'male';
            } else if (profileFor === 'daughter' || profileFor === 'sister') {
                finalGender = 'female';
            }
        }
        const user = await User.create({
            name,
            email,
            phoneNumber: mobile,
            password: hashed,
            profileFor,
            gender: finalGender,
            dob,
            occupation,
            location,
            agreeToTerms
        });
        const mailOptions = {
            from: 'Kumarsinha2574@gmail.com',
            to: email,
            subject: 'Welcome to Bandhan Nammatch!',
            html: `
                <h2>Hello ${name},</h2>
                <p>Thank you for registering with Bandhan Nammatch - your journey to find the perfect partner begins now!</p>
                <p><strong>Your registration details:</strong></p>
                <ul>
                    <li><strong>Name:</strong> ${name}</li>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Phone:</strong> ${mobile}</li>
                    <li><strong>Profile For:</strong> ${profileFor}</li>
                    ${finalGender ? `<li><strong>Gender:</strong> ${finalGender}</li>` : ''}
                </ul>
                <p>We're excited to help you find your perfect match. Login to explore profiles and start connecting!</p>
                <br />
                <p>Best regards,<br>Bandhan Nammatch Team</p>
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
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                profileFor: user.profileFor,
                gender: user.gender,
            }
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
    const { identifier, email, password } = req.body;
    const loginId = identifier || email;
    if (!loginId || !password) {
        return res.status(400).json({
            success: false,
            statusCode: 400,
            message: "Email/phone and password are required",
        });
    }
    try {
        const user = await User.findOne({
            $or: [{ email: loginId }, { phoneNumber: loginId }],
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                statusCode: 401,
                message: loginId.includes("@")
                    ? "Email not found"
                    : "Phone number not found",
            });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                statusCode: 401,
                message: "Incorrect password",
            });
        }
        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);
        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Login successful",
            data: {
                accessToken,
                refreshToken,
            },
        });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({
            success: false,
            statusCode: 500,
            message: "Server error",
            error: err.message,
        });
    }
};

export const refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return res.status(401).json({
            success: false,
            statusCode: 401,
            message: 'Refresh token required'
        });
    }
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(403).json({
                success: false,
                statusCode: 403,
                message: 'User not found'
            });
        }
        const newAccessToken = generateAccessToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);

        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Access token refreshed successfully',
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken // Send new refresh token if rotating
            },
        });
    } catch (err) {
        console.error('Refresh token error:', err);
        if (err.name === 'TokenExpiredError') {
            return res.status(403).json({
                success: false,
                statusCode: 403,
                message: 'Refresh token expired'
            });
        }
        if (err.name === 'JsonWebTokenError') {
            return res.status(403).json({
                success: false,
                statusCode: 403,
                message: 'Invalid refresh token'
            });
        }
        return res.status(500).json({
            success: false,
            statusCode: 500,
            message: 'Server error during token refresh',
            error: err.message
        });
    }
};

export const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Logout successful',
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: 'Server error during logout',
            error: error.message,
        });
    }
};

export const getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('-password -otp -otpExpiry -isOtpVerified');
        if (!user) {
            return res.status(404).json({
                success: false,
                statusCode: 404,
                message: 'User not found',
            });
        }
        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'User details fetched successfully',
            data: user,
        });
    } catch (err) {
        console.error("Get user details error:", err);
        return res.status(500).json({
            success: false,
            statusCode: 500,
            message: 'Server error while fetching user details',
            error: err.message,
        });
    }
};

export const updateUser = async (req, res) => {
    const userId = req.params.id;
    const { name, phoneNumber } = req.body;
    const profileImage = req.file ? req.file.path : undefined;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: 'User not found'
            });
        }

        user.name = name || user.name;
        user.phoneNumber = phoneNumber || user.phoneNumber;
        if (profileImage) user.profileImage = profileImage;

        await user.save();

        res.status(200).json({
            success: true,
            status: 200,
            message: 'User updated successfully',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phoneNumber: user.phoneNumber,
                profileImage: user.profileImage,
            }
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            status: 500,
            message: 'Server error',
            error: err.message
        });
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

export const resendOtp = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        // Generate new OTP and expiry
        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const newOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
        user.otp = newOtp;
        user.otpExpiry = newOtpExpiry;
        await user.save();
        await transporter.sendMail({
            from: 'kumarsinha2574@gmail.com',
            to: email,
            subject: 'Your New OTP for Password Reset',
            text: `Your new OTP is: ${newOtp}`,
        });
        res.status(200).json({ success: true, message: 'New OTP sent to your email' });
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


