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
      .populate('fromUser', 'name profileImage customId age height caste location isOnline lastSeen')
      .sort({ createdAt: -1 });

      const baseUrl = `${req.protocol}://${req.get('host')}`;

      // Get last messages for each conversation
      const conversationPromises = acceptedInterests.map(async (interest) => {
        const otherUserId = interest.fromUser._id;
        
        // Get last message between users
        const lastMessage = await Message.findOne({
          $or: [
            { sender: userId, receiver: otherUserId },
            { sender: otherUserId, receiver: userId }
          ]
        })
        .sort({ createdAt: -1 })
        .select('content createdAt')
        .lean();

        return {
          id: interest._id,
          type: 'acceptance',
          user: {
            id: interest.fromUser._id,
            name: interest.fromUser.name,
            age: interest.fromUser.age,
            height: interest.fromUser.height,
            caste: interest.fromUser.caste,
            location: interest.fromUser.location,
            profileImage: getImageUrl(baseUrl, interest.fromUser.profileImage),
            customId: interest.fromUser.customId,
            isOnline: interest.fromUser.isOnline || false,
            lastSeen: interest.fromUser.lastSeen
          },
          createdAt: interest.createdAt,
          message: interest.message,
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt
          } : null
        };
      });

      conversations = await Promise.all(conversationPromises);
    } else if (tab === 'interests') {
      // Get interests sent by current user
      const interests = await Interest.find({
        fromUser: userId
      })
      .populate('targetUser', 'name profileImage customId age height caste location isOnline lastSeen')
      .sort({ createdAt: -1 });

      const baseUrl = `${req.protocol}://${req.get('host')}`;

      // Get last messages for each conversation
      const conversationPromises = interests.map(async (interest) => {
        const otherUserId = interest.targetUser._id;
        
        // Get last message between users
        const lastMessage = await Message.findOne({
          $or: [
            { sender: userId, receiver: otherUserId },
            { sender: otherUserId, receiver: userId }
          ]
        })
        .sort({ createdAt: -1 })
        .select('content createdAt')
        .lean();

        return {
          id: interest._id,
          type: 'interest',
          user: {
            id: interest.targetUser._id,
            name: interest.targetUser.name,
            age: interest.targetUser.age,
            height: interest.targetUser.height,
            caste: interest.targetUser.caste,
            location: interest.targetUser.location,
            profileImage: getImageUrl(baseUrl, interest.targetUser.profileImage),
            customId: interest.targetUser.customId,
            isOnline: interest.targetUser.isOnline || false,
            lastSeen: interest.targetUser.lastSeen
          },
          createdAt: interest.createdAt,
          message: interest.message,
          status: interest.status,
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            createdAt: lastMessage.createdAt
          } : null
        };
      });

      conversations = await Promise.all(conversationPromises);
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

    // Get current user's gender for filtering opposite gender matches
    const currentUser = await User.findById(userId).select('gender');
    
    let matchQuery = {
      _id: { $ne: userId },
      isOnline: true,
      isActive: true
    };

    // Filter by opposite gender
    if (currentUser?.gender === 'male') {
      matchQuery.gender = 'female';
    } else if (currentUser?.gender === 'female') {
      matchQuery.gender = 'male';
    }

    const onlineMatches = await User.find(matchQuery)
      .limit(parseInt(limit))
      .select('name profileImage customId isOnline lastSeen gender')
      .sort({ lastSeen: -1 });

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const getImageUrl = (imagePath) => {
      if (!imagePath) return null;
      if (imagePath.startsWith('http')) return imagePath;
      if (imagePath.startsWith('uploads/') || imagePath.startsWith('/uploads/')) {
        return `${baseUrl}/${imagePath.startsWith('/') ? imagePath.slice(1) : imagePath}`;
      }
      return `${baseUrl}/uploads/${imagePath}`;
    };

    res.status(200).json({
      success: true,
      data: onlineMatches.map(match => ({
        id: match._id,
        _id: match._id,
        name: match.name,
        customId: match.customId,
        profileImage: getImageUrl(match.profileImage),
        avatar: getImageUrl(match.profileImage),
        isOnline: match.isOnline || true,
        lastSeen: match.lastSeen
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
