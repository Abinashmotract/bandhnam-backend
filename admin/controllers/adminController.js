import User from '../../models/User.js';
import Contact from '../../models/Contact.js';

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -otp -otpExpiry");

    return res.status(200).json({
      status: 200,
      success: true,
      message: "All users fetched successfully",
      totalUsers: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 }); // latest first

    return res.status(200).json({
      status: 200,
      success: true,
      message: "All contacts fetched successfully",
      totalContacts: contacts.length,
      contacts,
    });
  } catch (error) {
    console.error("Error fetching contacts:", error);
    return res.status(500).json({
      status: 500,
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};