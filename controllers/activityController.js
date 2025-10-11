import User from '../models/User.js';
import Interest from '../models/Interest.js';
import Notification from '../models/Notification.js';

// Get activity dashboard data
export const getActivityDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get accepted interests count
    const acceptedInterests = await Interest.countDocuments({
      targetUser: userId,
      status: 'accepted'
    });

    // Get interests received count
    const interestsReceived = await Interest.countDocuments({
      targetUser: userId
    });

    // Get interests sent count
    const interestsSent = await Interest.countDocuments({
      fromUser: userId
    });

    // Get shortlisted profiles count (assuming we have a shortlist model)
    const shortlistedProfiles = await Interest.countDocuments({
      fromUser: userId,
      status: 'shortlisted'
    });

    // Get declined interests count
    const declinedInterests = await Interest.countDocuments({
      targetUser: userId,
      status: 'declined'
    });

    // Get UP Match Hour data
    const upMatchHour = {
      title: "UP Match Hour",
      date: "12 Oct, Sun",
      time: "08:00 PM - 09:00 PM",
      registeredCount: 13127,
      participants: [
        { name: "A", avatar: "A" },
        { name: "B", avatar: "B" },
        { name: "C", avatar: "C" }
      ]
    };

    // Get online matches
    const onlineMatches = await User.find({
      _id: { $ne: userId },
      isOnline: true
    }).limit(22).select('name profileImage customId');

    // Get profile visit stats
    const profileVisits = await Notification.countDocuments({
      userId: userId,
      type: 'profile_view'
    });

    res.status(200).json({
      success: true,
      data: {
        activityCards: {
          acceptedInterests,
          interestsReceived,
          interestsSent,
          shortlistedProfiles,
          declinedInterests
        },
        upMatchHour,
        onlineMatches: onlineMatches.map(match => ({
          name: match.name,
          avatar: match.name.charAt(0),
          customId: match.customId,
          profileImage: match.profileImage
        })),
        profileVisits
      }
    });
  } catch (error) {
    console.error('Error fetching activity dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity dashboard',
      error: error.message
    });
  }
};

// Get online matches
export const getOnlineMatches = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 22 } = req.query;

    const onlineMatches = await User.find({
      _id: { $ne: userId },
      isOnline: true
    })
    .limit(parseInt(limit))
    .select('name profileImage customId isOnline')
    .sort({ lastSeen: -1 });

    res.status(200).json({
      success: true,
      data: onlineMatches.map(match => ({
        id: match._id,
        name: match.name,
        customId: match.customId,
        profileImage: match.profileImage,
        isOnline: match.isOnline
      }))
    });
  } catch (error) {
    console.error('Error fetching online matches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch online matches',
      error: error.message
    });
  }
};
