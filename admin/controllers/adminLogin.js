// admin/controllers/adminLogin.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import AdminCredential from "../../models/AdminCredential.js";

// Admin login function
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Email and password are required",
      });
    }

    const admin = await AdminCredential.findOne({
      email: email.toLowerCase().trim(),
      isActive: true,
    });

    if (!admin) {
      return res.status(401).json({
        status: 401,
        success: false,
        message: "Authentication failed. Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, admin.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 401,
        success: false,
        message: "Authentication failed. Invalid email or password",
      });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret";
    const token = jwt.sign(
      { role: "admin", email: admin.email, id: admin._id },
      jwtSecret,
      { expiresIn: "30d" }
    );

    // Set cookie
    res.cookie("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Admin authentication successful",
      token,
    });
  } catch (error) {
    console.error("Error in adminLogin:", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Admin logout function
export const logoutAdmin = (req, res) => {
  try {
    res.clearCookie("admin_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      status: 200,
      success: true,
      message: "Admin logged out successfully",
    });
  } catch (error) {
    console.error("Error in logoutAdmin:", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
