import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateAccessToken, generateRefreshToken } from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "kumarsinha2574@gmail.com",
        pass: "tsod jopw zhbe qklp",
    },
});

export const sendWelcomeEmail = async (user) => {
    const { name, email, phoneNumber, profileFor, gender } = user;

    const mailOptions = {
        from: "Kumarsinha2574@gmail.com",
        to: email,
        subject: "Welcome to Bandhnam Nammatch!",
        html: `
      <h2>Hello ${name},</h2>
      <p>Thank you for registering with Bandhnam Nammatch - your journey to find the perfect partner begins now!</p>
      <p><strong>Your registration details:</strong></p>
      <ul>
        <li><strong>Name:</strong> ${name}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Phone:</strong> ${phoneNumber}</li>
        <li><strong>Profile For:</strong> ${profileFor}</li>
        ${gender ? `<li><strong>Gender:</strong> ${gender}</li>` : ""}
      </ul>
      <p>We're excited to help you find your perfect match. Login to explore profiles and start connecting!</p>
      <br />
      <p>Best regards,<br>Bandhnam Nammatch Team</p>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Welcome email sent to:", email);
        return true;
    } catch (error) {
        console.error("Error sending welcome email:", error);
        return false;
    }
};


export const signup = async (req, res) => {
    try {
        const { name, email, mobile, password, confirmPassword, profileFor, gender, dob, state, city, location,
            religion, caste, subCaste, motherTongue, maritalStatus, highestQualification, fieldOfStudy, occupation,
            industry, annualIncome, education, height, weight, bodyType, complexion, diet, drinkingHabits, smokingHabits,
            fitnessLevel, hobbies, interests, languagesKnown, petPreferences, preferences, fatherOccupation, motherOccupation,
            brothers, brothersMarried, sisters, sistersMarried, familyType, familyIncome, nativePlace, familyStatus, about, photos,
            profileImage, agreeToTerms, } = req.body;
        if (!name || !email || !mobile || !password || !profileFor) {
            return res.status(400).json({ success: false, message: "All required fields must be provided" });
        }
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: "Passwords do not match" });
        }
        if (!agreeToTerms) {
            return res.status(400).json({ success: false, message: "You must agree to the terms and conditions" });
        }
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(mobile)) {
            return res.status(400).json({ success: false, message: "Phone number must be exactly 10 digits" });
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                message:
                    "Password must be at least 8 characters and include one uppercase letter, one lowercase letter, one number, and one special character.",
            });
        }
        // --- Check if user exists ---
        const userExists = await User.findOne({
            $or: [{ email }, { phoneNumber: mobile }],
        });
        if (userExists) {
            return res.status(400).json({ success: false, message: "User with this email or phone number already exists" });
        }
        // --- Hash password ---
        const hashed = await bcrypt.hash(password, 10);
        // --- Auto gender fill ---
        let finalGender = gender;
        if (!finalGender) {
            if (profileFor === "son" || profileFor === "brother") {
                finalGender = "male";
            } else if (profileFor === "daughter" || profileFor === "sister") {
                finalGender = "female";
            }
        }
        // --- Create User ---
        const user = await User.create({
            name, email, phoneNumber: mobile, password: hashed, profileFor, gender: finalGender, dob,
            state, city, location, religion, caste, subCaste, motherTongue, maritalStatus, highestQualification, fieldOfStudy,
            occupation, industry, annualIncome, education, height, weight, bodyType, complexion, diet, drinkingHabits, smokingHabits,
            fitnessLevel, hobbies, interests, languagesKnown, petPreferences, preferences, fatherOccupation, motherOccupation, brothers,
            brothersMarried, sisters, sistersMarried, familyType, familyIncome, nativePlace, familyStatus, about, photos, profileImage,
            agreeToTerms,
        });
        // --- Send Welcome Email ---
        await sendWelcomeEmail(user);
        return res.status(201).json({
            success: true,
            message: "User registered successfully. Welcome email sent.",
            data: { id: user._id, email: user.email, profileCompletion: user.profileCompletion },
        });
    } catch (err) {
        console.error("Signup error:", err);
        return res.status(500).json({ success: false, message: "Server error", error: err.message });
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
                message: loginId.includes("@") ? "Email not found" : "Phone number not found",
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
        const payload = { id: user._id, role: user.role };
        const accessToken = generateAccessToken(payload);
        const refreshToken = generateRefreshToken(payload);
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
            message: "Refresh token required",
        });
    }
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(403).json({
                success: false,
                statusCode: 403,
                message: "User not found",
            });
        }
        const newAccessToken = generateAccessToken(user._id);
        const newRefreshToken = generateRefreshToken(user._id);

        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Access token refreshed successfully",
            data: {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken, // Send new refresh token if rotating
            },
        });
    } catch (err) {
        console.error("Refresh token error:", err);
        if (err.name === "TokenExpiredError") {
            return res.status(403).json({
                success: false,
                statusCode: 403,
                message: "Refresh token expired",
            });
        }
        if (err.name === "JsonWebTokenError") {
            return res.status(403).json({
                success: false,
                statusCode: 403,
                message: "Invalid refresh token",
            });
        }
        return res.status(500).json({
            success: false,
            statusCode: 500,
            message: "Server error during token refresh",
            error: err.message,
        });
    }
};

export const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Logout successful",
        });
    } catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({
            success: false,
            statusCode: 500,
            message: "Server error during logout",
            error: error.message,
        });
    }
};

export const getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password -otp -otpExpiry -isOtpVerified");
        if (!user) {
            return res.status(404).json({
                success: false,
                statusCode: 404,
                message: "User not found",
            });
        }

        const baseUrl = `${req.protocol}://${req.get("host")}`;

        const userData = {
            ...user.toObject(),
            profileImage: user.profileImage ? `${baseUrl}/${user.profileImage}` : null,
            photos: user.photos?.map(photo => `${baseUrl}/${photo}`) || [],
        };

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: "User details fetched successfully",
            data: userData,
        });
    } catch (err) {
        console.error("Get user details error:", err);
        return res.status(500).json({
            success: false,
            statusCode: 500,
            message: "Server error while fetching user details",
            error: err.message,
        });
    }
};

export const updateUser = async (req, res) => {
    const userId = req.user._id;
    const {
        name,
        email,
        phoneNumber,
        dob,
        occupation,
        location,
        education,
        motherTongue,
        religion,
        caste,
        about,
        interests,
        preferences,
    } = req.body;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "User not found",
            });
        }
        user.name = name || user.name;
        user.email = email || user.email;
        user.phoneNumber = phoneNumber || user.phoneNumber;
        user.dob = dob || user.dob;
        user.occupation = occupation || user.occupation;
        user.location = location || user.location;
        user.education = education || user.education;
        user.motherTongue = motherTongue || user.motherTongue;
        user.religion = religion || user.religion;
        user.caste = caste || user.caste;
        user.about = about || user.about;
        if (interests) {
            try {
                const parsedInterests = typeof interests === "string" ? JSON.parse(interests) : interests;
                if (Array.isArray(parsedInterests)) {
                    user.interests = parsedInterests;
                }
            } catch (error) {
                console.error("Error parsing interests:", error);
            }
        }
        if (req.files && req.files.photos) {
            const photoFiles = Array.isArray(req.files.photos) ? req.files.photos : [req.files.photos];
            photoFiles.forEach((file) => {
                user.photos.push(file.path);
            });
        }
        if (preferences) {
            try {
                const parsedPreferences = typeof preferences === "string" ? JSON.parse(preferences) : preferences;
                
                // Only update preferences that are provided and not undefined
                const validPreferences = {};
                Object.keys(parsedPreferences).forEach(key => {
                    if (parsedPreferences[key] !== undefined && parsedPreferences[key] !== null) {
                        validPreferences[key] = parsedPreferences[key];
                    }
                });
                
                // Merge with existing preferences
                user.preferences = {
                    ...user.preferences,
                    ...validPreferences,
                };
            } catch (error) {
                console.error("Error parsing preferences:", error);
            }
        }

        await user.save();

        res.status(200).json({
            success: true,
            status: 200,
            message: "User updated successfully",
        });
    } catch (err) {
        console.error("Update user error:", err);
        res.status(500).json({
            success: false,
            status: 500,
            message: "Server error",
            error: err.message,
        });
    }
};

export const updateProfilePicture = async (req, res) => {
    const userId = req.user._id;
    if (!req.file) {
        return res.status(400).json({
            success: false,
            status: 400,
            message: "Profile image is required",
        });
    }
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "User not found",
            });
        }
        if (user.profileImage) {
            const oldImagePath = path.resolve(__dirname, "..", user.profileImage);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        user.profileImage = req.file.path;
        await user.save();
        const baseUrl = `${req.protocol}://${req.get("host")}`;
        res.status(200).json({
            success: true,
            status: 200,
            message: "Profile picture updated successfully",
            data: {
                profileImage: `${baseUrl}/${user.profileImage}`,
            },
        });
    } catch (err) {
        console.error("Update profile picture error:", err);
        res.status(500).json({
            success: false,
            status: 500,
            message: "Server error",
            error: err.message,
        });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({
            success: false,
            status: 400,
            message: "Email is required",
        });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(200).json({
                success: true,
                status: 200,
                message: "If the email exists, a password reset OTP has been sent",
            });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = Date.now() + 10 * 60 * 1000;
        user.otp = otp;
        user.otpExpiry = otpExpiry;
        user.isOtpVerified = false;
        await user.save();
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #51365F;">Password Reset Request</h2>
                <p>Hello ${user.name},</p>
                <p>You requested to reset your password. Use the OTP below to proceed:</p>
                <div style="background-color: #f8bbd0; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px;">
                    <h1 style="margin: 0; color: #51365F; letter-spacing: 5px;">${otp}</h1>
                </div>
                <p>This OTP will expire in 10 minutes.</p>
                <p>If you didn't request this reset, please ignore this email.</p>
                <br />
                <p>Best regards,<br>Bandhnam Nammatch Team</p>
            </div>
        `;
        await sendEmail(email, "Password Reset OTP - Bandhnam Nammatch", html);
        return res.status(200).json({
            success: true,
            status: 200,
            message: "If the email exists, a password reset OTP has been sent",
        });
    } catch (err) {
        console.error("Forgot password error:", err);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Server error",
            error: err.message,
        });
    }
};

// -------------------- RESEND OTP --------------------
export const resendOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, status: 400, message: "Email is required" });

    try {
        const user = await User.findOne({ email });
        if (!user)
            return res
                .status(200)
                .json({ success: true, status: 200, message: "If the email exists, a new OTP has been sent" });

        if (user.otpExpiry > Date.now() && user.otp) {
            const minutesLeft = Math.ceil((user.otpExpiry - Date.now()) / 1000 / 60);
            return res
                .status(429)
                .json({ success: false, status: 429, message: `Wait ${minutesLeft} min before requesting new OTP` });
        }

        const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = newOtp;
        user.otpExpiry = Date.now() + 10 * 60 * 1000;
        user.isOtpVerified = false;
        await user.save();

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #51365F;">New OTP for Password Reset</h2>
                <p>Hello ${user.name},</p>
                <p>Your new OTP is:</p>
                <div style="background-color: #f8bbd0; padding: 15px; text-align: center; margin: 20px 0; border-radius: 5px;">
                    <h1 style="margin: 0; color: #51365F; letter-spacing: 5px;">${newOtp}</h1>
                </div>
                <p>This OTP will expire in 10 minutes.</p>
                <br />
                <p>Best regards,<br>Bandhnam Nammatch Team</p>
            </div>
        `;
        await sendEmail(email, "New OTP for Password Reset - Bandhnam Nammatch", html);

        res.status(200).json({ success: true, status: 200, message: "New OTP sent successfully" });
    } catch (err) {
        console.error("Resend OTP error:", err);
        res.status(500).json({ success: false, status: 500, message: "Server error", error: err.message });
    }
};

// -------------------- VERIFY OTP --------------------
export const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp)
        return res.status(400).json({ success: false, status: 400, message: "Email and OTP are required" });

    try {
        const user = await User.findOne({ email });
        if (!user || user.otp !== otp || user.otpExpiry < Date.now()) {
            return res.status(400).json({ success: false, status: 400, message: "Invalid or expired OTP" });
        }

        user.isOtpVerified = true;
        await user.save();

        const resetToken = jwt.sign(
            { userId: user._id, purpose: "password_reset" },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "15m" }
        );

        // Optional: send confirmation email that OTP verified
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #51365F;">OTP Verified Successfully</h2>
                <p>Hello ${user.name},</p>
                <p>Your OTP has been verified. You can now reset your password.</p>
                <br />
                <p>Best regards,<br>Bandhnam Nammatch Team</p>
            </div>
        `;
        await sendEmail(email, "OTP Verified - Bandhnam Nammatch", html);

        res.status(200).json({
            success: true,
            status: 200,
            message: "OTP verified successfully",
            data: { resetToken, email: user.email },
        });
    } catch (err) {
        console.error("Verify OTP error:", err);
        res.status(500).json({ success: false, status: 500, message: "Server error", error: err.message });
    }
};

// -------------------- RESET PASSWORD --------------------
export const resetPassword = async (req, res) => {
    const { email, newPassword, confirmPassword, resetToken } = req.body;
    if (!email || !newPassword || !confirmPassword)
        return res
            .status(400)
            .json({ success: false, status: 400, message: "Email, new password and confirmation are required" });
    if (newPassword !== confirmPassword)
        return res.status(400).json({ success: false, status: 400, message: "Passwords do not match" });

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!passwordRegex.test(newPassword))
        return res
            .status(400)
            .json({ success: false, status: 400, message: "Password must meet complexity requirements" });

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ success: false, status: 404, message: "User not found" });

        if (!user.isOtpVerified)
            return res.status(403).json({ success: false, status: 403, message: "OTP not verified" });

        // Verify reset token
        if (resetToken) {
            try {
                const decoded = jwt.verify(resetToken, process.env.JWT_SECRET || "your-secret-key");
                if (decoded.userId !== user._id.toString() || decoded.purpose !== "password_reset") {
                    return res.status(403).json({ success: false, status: 403, message: "Invalid reset token" });
                }
            } catch {
                return res.status(403).json({ success: false, status: 403, message: "Invalid or expired reset token" });
            }
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.otp = null;
        user.otpExpiry = null;
        user.isOtpVerified = false;
        await user.save();

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #51365F;">Password Reset Successful</h2>
                <p>Hello ${user.name},</p>
                <p>Your password has been successfully reset.</p>
                <br />
                <p>Best regards,<br>Bandhnam Nammatch Team</p>
            </div>
        `;
        await sendEmail(email, "Password Reset Successful - Bandhnam Nammatch", html);

        res.status(200).json({ success: true, status: 200, message: "Password reset successful" });
    } catch (err) {
        console.error("Reset password error:", err);
        res.status(500).json({ success: false, status: 500, message: "Server error", error: err.message });
    }
};
