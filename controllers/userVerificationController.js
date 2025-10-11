import User from "../models/User.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadDir = 'uploads/verification/';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

export const uploadMiddleware = upload;

// Send email verification
export const sendEmailVerification = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified"
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    // Send verification email (simplified for demo)
    console.log(`Email verification token for ${user.email}: ${verificationToken}`);

    res.status(200).json({
      success: true,
      message: "Verification email sent successfully",
      data: {
        email: user.email,
        expiresIn: "24 hours"
      }
    });
  } catch (error) {
    console.error("Send email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sending verification email",
      error: error.message
    });
  }
};

// Confirm email verification
export const confirmEmailVerification = async (req, res) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required"
      });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token"
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully"
    });
  } catch (error) {
    console.error("Confirm email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while confirming email verification",
      error: error.message
    });
  }
};

// Send phone verification
export const sendPhoneVerification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { phoneNumber } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.isPhoneVerified) {
      return res.status(400).json({
        success: false,
        message: "Phone already verified"
      });
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.phoneVerificationOTP = otp;
    user.phoneVerificationExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send OTP (simplified for demo)
    console.log(`Phone verification OTP for ${phoneNumber}: ${otp}`);

    res.status(200).json({
      success: true,
      message: "Verification OTP sent successfully",
      data: {
        phoneNumber: phoneNumber,
        expiresIn: "10 minutes"
      }
    });
  } catch (error) {
    console.error("Send phone verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sending verification OTP",
      error: error.message
    });
  }
};

// Confirm phone verification
export const confirmPhoneVerification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otp } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.phoneVerificationOTP !== otp || user.phoneVerificationExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    user.isPhoneVerified = true;
    user.phoneVerificationOTP = undefined;
    user.phoneVerificationExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Phone verified successfully"
    });
  } catch (error) {
    console.error("Confirm phone verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while confirming phone verification",
      error: error.message
    });
  }
};

// Upload ID verification
export const uploadIdVerification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { documentType, documentNumber } = req.body;
    
    if (!req.files || !req.files.frontImage) {
      return res.status(400).json({
        success: false,
        message: "Front image is required"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update user with ID verification info
    user.idVerification = {
      documentType,
      documentNumber,
      frontImage: req.files.frontImage[0].filename,
      backImage: req.files.backImage ? req.files.backImage[0].filename : null,
      status: 'pending',
      submittedAt: new Date()
    };
    await user.save();

    res.status(200).json({
      success: true,
      message: "ID verification documents uploaded successfully",
      data: {
        status: 'pending',
        submittedAt: user.idVerification.submittedAt
      }
    });
  } catch (error) {
    console.error("Upload ID verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while uploading ID verification",
      error: error.message
    });
  }
};

// Upload verification photos
export const uploadVerificationPhotos = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!req.files || !req.files.photos) {
      return res.status(400).json({
        success: false,
        message: "Verification photos are required"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Update user with photo verification info
    user.photoVerification = {
      photos: req.files.photos.map(file => file.filename),
      status: 'pending',
      submittedAt: new Date()
    };
    await user.save();

    res.status(200).json({
      success: true,
      message: "Verification photos uploaded successfully",
      data: {
        status: 'pending',
        submittedAt: user.photoVerification.submittedAt
      }
    });
  } catch (error) {
    console.error("Upload verification photos error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while uploading verification photos",
      error: error.message
    });
  }
};

// Get verification status
export const getVerificationStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('isEmailVerified isPhoneVerified idVerification photoVerification');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const verificationStatus = {
      email: {
        verified: user.isEmailVerified || false,
        status: user.isEmailVerified ? 'verified' : 'pending'
      },
      phone: {
        verified: user.isPhoneVerified || false,
        status: user.isPhoneVerified ? 'verified' : 'pending'
      },
      id: {
        verified: user.idVerification?.status === 'approved' || false,
        status: user.idVerification?.status || 'not-submitted',
        submittedAt: user.idVerification?.submittedAt
      },
      photo: {
        verified: user.photoVerification?.status === 'approved' || false,
        status: user.photoVerification?.status || 'not-submitted',
        submittedAt: user.photoVerification?.submittedAt
      }
    };

    res.status(200).json({
      success: true,
      message: "Verification status retrieved successfully",
      data: verificationStatus
    });
  } catch (error) {
    console.error("Get verification status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching verification status",
      error: error.message
    });
  }
};
