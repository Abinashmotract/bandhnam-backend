import Verification from "../models/Verification.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";
import nodemailer from "nodemailer";

// Send email verification
export const sendEmailVerification = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const user = await User.findById(currentUserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if email is already verified
    const existingVerification = await Verification.findOne({
      user: currentUserId,
      type: "email",
      status: "verified"
    });

    if (existingVerification) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified"
      });
    }

    // Generate verification token
    const emailToken = jwt.sign(
      { userId: currentUserId, type: "email_verification" },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    // Create or update verification record
    await Verification.findOneAndUpdate(
      { user: currentUserId, type: "email" },
      {
        user: currentUserId,
        type: "email",
        status: "pending",
        emailToken,
        emailTokenExpiry: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
      },
      { upsert: true, new: true }
    );

    // Send verification email
    const verificationUrl = `${req.protocol}://${req.get("host")}/api/verify/email/confirm?token=${emailToken}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d81b60;">Verify Your Email Address</h2>
        <p>Hello ${user.name},</p>
        <p>Thank you for registering with Bandhnam Nammatch! Please verify your email address to complete your registration.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #d81b60; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account with us, please ignore this email.</p>
        <br />
        <p>Best regards,<br>Bandhnam Nammatch Team</p>
      </div>
    `;

    await sendEmail(user.email, "Verify Your Email - Bandhnam Nammatch", html);

    res.status(200).json({
      success: true,
      message: "Verification email sent successfully"
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

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    
    if (decoded.type !== "email_verification") {
      return res.status(400).json({
        success: false,
        message: "Invalid verification token"
      });
    }

    // Find verification record
    const verification = await Verification.findOne({
      user: decoded.userId,
      type: "email",
      emailToken: token,
      status: "pending"
    });

    if (!verification) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token"
      });
    }

    if (verification.emailTokenExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Verification token has expired"
      });
    }

    // Update verification status
    verification.status = "verified";
    verification.emailToken = null;
    verification.emailTokenExpiry = null;
    await verification.save();

    // Update user's email verification status
    await User.findByIdAndUpdate(decoded.userId, {
      isEmailVerified: true
    });

    res.status(200).json({
      success: true,
      message: "Email verified successfully"
    });

  } catch (error) {
    console.error("Confirm email verification error:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({
        success: false,
        message: "Verification token has expired"
      });
    }
    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({
        success: false,
        message: "Invalid verification token"
      });
    }
    res.status(500).json({
      success: false,
      message: "Server error while confirming email verification",
      error: error.message
    });
  }
};

// Send phone verification OTP
export const sendPhoneVerification = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { phoneNumber } = req.body || {};

    const user = await User.findById(currentUserId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const targetPhone = phoneNumber || user.phoneNumber;
    if (!targetPhone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required"
      });
    }

    // Check if phone is already verified
    const existingVerification = await Verification.findOne({
      user: currentUserId,
      type: "phone",
      status: "verified"
    });

    if (existingVerification) {
      return res.status(400).json({
        success: false,
        message: "Phone number is already verified"
      });
    }

    // Generate OTP (static for now)
    const phoneOtp = "123456";
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create or update verification record
    await Verification.findOneAndUpdate(
      { user: currentUserId, type: "phone" },
      {
        user: currentUserId,
        type: "phone",
        status: "pending",
        phoneOtp,
        phoneOtpExpiry: otpExpiry
      },
      { upsert: true, new: true }
    );

    // In a real application, you would send SMS here
    // For now, we'll just return the OTP (static) (remove this in production)
    console.log(`OTP for ${targetPhone}: ${phoneOtp}`);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      // Remove this in production
      data: { otp: phoneOtp }
    });

  } catch (error) {
    console.error("Send phone verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sending OTP",
      error: error.message
    });
  }
};

// Confirm phone verification
export const confirmPhoneVerification = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { otp, code } = req.body;
    const providedOtp = otp || code;

    if (!providedOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required"
      });
    }

    // Find verification record
    const verification = await Verification.findOne({
      user: currentUserId,
      type: "phone",
      status: "pending"
    });

    if (!verification) {
      return res.status(400).json({
        success: false,
        message: "No pending phone verification found"
      });
    }

    if (verification.phoneOtp !== providedOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    if (verification.phoneOtpExpiry < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired"
      });
    }

    // Update verification status
    verification.status = "verified";
    verification.phoneOtp = null;
    verification.phoneOtpExpiry = null;
    await verification.save();

    // Update user's phone verification status
    await User.findByIdAndUpdate(currentUserId, {
      isPhoneVerified: true
    });

    res.status(200).json({
      success: true,
      message: "Phone number verified successfully"
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

// Upload ID document for verification
export const uploadIdVerification = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { documentType, documentNumber } = req.body;

    if (!documentType || !documentNumber) {
      return res.status(400).json({
        success: false,
        message: "Document type and number are required"
      });
    }

    if (!req.files || !req.files.frontImage) {
      return res.status(400).json({
        success: false,
        message: "Front image of ID document is required"
      });
    }

    const frontImage = req.files.frontImage[0].path;
    const backImage = req.files.backImage ? req.files.backImage[0].path : null;

    // Create or update verification record and mark as verified immediately
    const verification = await Verification.findOneAndUpdate(
      { user: currentUserId, type: "id" },
      {
        user: currentUserId,
        type: "id",
        status: "verified",
        reviewedAt: new Date(),
        idDocument: {
          frontImage,
          backImage,
          documentType,
          documentNumber
        }
      },
      { upsert: true, new: true }
    );

    // Also set user's id verification flag immediately
    await User.findByIdAndUpdate(currentUserId, { isIdVerified: true });

    res.status(201).json({
      success: true,
      message: "ID document verified successfully",
      data: { verificationId: verification._id }
    });

  } catch (error) {
    console.error("Upload ID verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while uploading ID document",
      error: error.message
    });
  }
};

// Upload verification photos
export const uploadVerificationPhotos = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    if (!req.files || !req.files.photos) {
      return res.status(400).json({
        success: false,
        message: "Verification photos are required"
      });
    }

    const photos = req.files.photos.map(file => file.path);

    // Create or update verification record
    const verification = await Verification.findOneAndUpdate(
      { user: currentUserId, type: "photo" },
      {
        user: currentUserId,
        type: "photo",
        status: "pending",
        verificationPhotos: photos
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      message: "Verification photos uploaded successfully. They will be reviewed by our team.",
      data: { verificationId: verification._id }
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
    const currentUserId = req.user._id;

    const verifications = await Verification.find({
      user: currentUserId
    }).select("type status createdAt reviewedAt rejectionReason");

    const status = {
      email: { verified: false, status: "not_verified" },
      phone: { verified: false, status: "not_verified" },
      id: { verified: false, status: "not_verified" },
      photo: { verified: false, status: "not_verified" }
    };

    verifications.forEach(verification => {
      status[verification.type] = {
        verified: verification.status === "verified",
        status: verification.status,
        createdAt: verification.createdAt,
        reviewedAt: verification.reviewedAt,
        rejectionReason: verification.rejectionReason
      };
    });

    res.status(200).json({
      success: true,
      message: "Verification status fetched successfully",
      data: status
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

// Admin: Get pending verifications
export const getPendingVerifications = async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;

    let filters = { status: "pending" };
    if (type) {
      filters.type = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const verifications = await Verification.find(filters)
      .populate("user", "name email phoneNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Verification.countDocuments(filters);

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const pendingVerifications = verifications.map(verification => ({
      _id: verification._id,
      type: verification.type,
      user: {
        _id: verification.user._id,
        name: verification.user.name,
        email: verification.user.email,
        phoneNumber: verification.user.phoneNumber
      },
      status: verification.status,
      createdAt: verification.createdAt,
      idDocument: verification.idDocument ? {
        documentType: verification.idDocument.documentType,
        documentNumber: verification.idDocument.documentNumber,
        frontImage: verification.idDocument.frontImage ? 
          `${baseUrl}/${verification.idDocument.frontImage}` : null,
        backImage: verification.idDocument.backImage ? 
          `${baseUrl}/${verification.idDocument.backImage}` : null
      } : null,
      verificationPhotos: verification.verificationPhotos?.map(photo => 
        `${baseUrl}/${photo}`
      ) || []
    }));

    res.status(200).json({
      success: true,
      message: "Pending verifications fetched successfully",
      data: {
        verifications: pendingVerifications,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          hasNext: skip + parseInt(limit) < totalCount,
          hasPrev: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error("Get pending verifications error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching pending verifications",
      error: error.message
    });
  }
};

// Admin: Approve/reject verification
export const reviewVerification = async (req, res) => {
  try {
    const { verificationId } = req.params;
    const { status, rejectionReason, adminNotes } = req.body;

    if (!status || !["verified", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'verified' or 'rejected'"
      });
    }

    if (status === "rejected" && !rejectionReason) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required when rejecting verification"
      });
    }

    const verification = await Verification.findById(verificationId);
    if (!verification) {
      return res.status(404).json({
        success: false,
        message: "Verification not found"
      });
    }

    verification.status = status;
    verification.reviewedBy = req.user.id;
    verification.reviewedAt = new Date();
    verification.rejectionReason = rejectionReason;
    verification.adminNotes = adminNotes;

    await verification.save();

    // Update user's verification status
    const updateField = `is${verification.type.charAt(0).toUpperCase() + verification.type.slice(1)}Verified`;
    await User.findByIdAndUpdate(verification.user, {
      [updateField]: status === "verified"
    });

    res.status(200).json({
      success: true,
      message: `Verification ${status} successfully`
    });

  } catch (error) {
    console.error("Review verification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while reviewing verification",
      error: error.message
    });
  }
};
