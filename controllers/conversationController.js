import User from '../models/User.js';
import Interest from '../models/Interest.js';
import Message from '../models/Message.js';

// Get conversations for different tabs
export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tab = 'acceptances' } = req.query;

    let conversations = [];

    if (tab === 'acceptances') {
      // Get accepted interests
      const acceptedInterests = await Interest.find({
        targetUser: userId,
        status: 'accepted'
      })
      .populate('fromUser', 'name profileImage customId age height caste location')
      .sort({ createdAt: -1 });

      conversations = acceptedInterests.map(interest => ({
        id: interest._id,
        type: 'acceptance',
        user: {
          id: interest.fromUser._id,
          name: interest.fromUser.name,
          age: interest.fromUser.age,
          height: interest.fromUser.height,
          caste: interest.fromUser.caste,
          location: interest.fromUser.location,
          profileImage: interest.fromUser.profileImage,
          customId: interest.fromUser.customId
        },
        createdAt: interest.createdAt,
        message: interest.message
      }));
    } else if (tab === 'interests') {
      // Get interests sent by current user
      const interests = await Interest.find({
        fromUser: userId
      })
      .populate('targetUser', 'name profileImage customId age height caste location')
      .sort({ createdAt: -1 });

      conversations = interests.map(interest => ({
        id: interest._id,
        type: 'interest',
        user: {
          id: interest.targetUser._id,
          name: interest.targetUser.name,
          age: interest.targetUser.age,
          height: interest.targetUser.height,
          caste: interest.targetUser.caste,
          location: interest.targetUser.location,
          profileImage: interest.targetUser.profileImage,
          customId: interest.targetUser.customId
        },
        createdAt: interest.createdAt,
        message: interest.message,
        status: interest.status
      }));
    } else if (tab === 'calls') {
      // Get call history (if we have a calls model)
      // For now, return empty array
      conversations = [];
    }

    res.status(200).json({
      success: true,
      data: conversations
    });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch conversations',
      error: error.message
    });
  }
};

// Get UP Match Hour data
export const getUpMatchHour = async (req, res) => {
  try {
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

    res.status(200).json({
      success: true,
      data: upMatchHour
    });
  } catch (error) {
    console.error('Error fetching UP Match Hour:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch UP Match Hour data',
      error: error.message
    });
  }
};

// Get online matches for messenger
export const getMessengerOnlineMatches = async (req, res) => {
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
