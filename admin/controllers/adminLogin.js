// admin/controllers/adminLogin.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const ADMIN_EMAIL = "bandhnam@example.com";
const ADMIN_PASSWORD = "Bandhnam@123"; // You can hash it if you want

// Admin login function
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 400,
        success: false,
        message: "Email and password are required",
      });
    }

    // Check email
    if (email !== ADMIN_EMAIL) {
      return res.status(401).json({
        status: 401,
        success: false,
        message: "Authentication failed. Invalid email or password",
      });
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(password, await bcrypt.hash(ADMIN_PASSWORD, 10));
    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 401,
        success: false,
        message: "Authentication failed. Invalid email or password",
      });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || "your_jwt_secret";
    const token = jwt.sign({ role: "admin", email: ADMIN_EMAIL }, jwtSecret, { expiresIn: "30d" });

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
