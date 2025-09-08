import User from "../models/User.js";

export const getAllProfiles = async (req, res) => {
  try {
    // current logged-in user id
    const currentUserId = req.user._id;
    const users = await User.find(
      { _id: { $ne: currentUserId } }, 
      "-password -otp -otpExpiry -isOtpVerified" // remove sensitive fields
    );

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const profiles = users.map(u => ({
      _id: u._id,
      name: u.name,
      gender: u.gender,
      dob: u.dob,
      occupation: u.occupation,
      location: u.location,
      profileFor: u.profileFor,
      education: u.education,
      religion: u.religion,
      caste: u.caste,
      about: u.about,
      profileImage: u.profileImage ? `${baseUrl}/${u.profileImage}` : null,
      photos: u.photos?.map(photo => `${baseUrl}/${photo}`) || []
    }));

    return res.status(200).json({
      success: true,
      status: 200,
      message: "Profiles fetched successfully",
      data: profiles,
    });
  } catch (err) {
    console.error("Get all profiles error:", err);
    return res.status(500).json({
      success: false,
      status: 500,
      message: "Server error while fetching profiles",
      error: err.message,
    });
  }
};
