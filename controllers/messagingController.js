// import Message from "../models/Message.js";
// import ChatRoom from "../models/ChatRoom.js";
// import User from "../models/User.js";
// import Notification from "../models/Notification.js";

// // Get or create chat room with a user
// const getOrCreateChatRoom = async (user1Id, user2Id) => {
//   let chatRoom = await ChatRoom.findOne({
//     participants: { $all: [user1Id, user2Id] },
//     isActive: true
//   });

//   if (!chatRoom) {
//     chatRoom = await ChatRoom.create({
//       participants: [user1Id, user2Id],
//       isActive: true
//     });
//   }

//   return chatRoom;
// };

// // Send message to a user
// export const sendMessage = async (req, res) => {
//   try {
//     const currentUserId = req.user._id;
//     const { userId } = req.params;
//     const { content, messageType = "text" } = req.body;

//     if (!content) {
//       return res.status(400).json({
//         success: false,
//         message: "Message content is required"
//       });
//     }

//     if (currentUserId.toString() === userId) {
//       return res.status(400).json({
//         success: false,
//         message: "Cannot send message to yourself"
//       });
//     }

//     // Check if target user exists
//     const targetUser = await User.findById(userId);
//     if (!targetUser) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found"
//       });
//     }

//     // Check if users can message each other (both should have liked each other or be matched)
//     const canMessage = await Message.findOne({
//       $or: [
//         { sender: currentUserId, receiver: userId },
//         { sender: userId, receiver: currentUserId }
//       ]
//     });

//     // For now, allow messaging if there's any previous interaction
//     // In a real app, you might want to check for mutual likes or matches
//     const hasInteraction = await require("../models/Interaction.js").default.findOne({
//       $or: [
//         { fromUser: currentUserId, toUser: userId, type: { $in: ["like", "superlike"] } },
//         { fromUser: userId, toUser: currentUserId, type: { $in: ["like", "superlike"] } }
//       ]
//     });

//     if (!canMessage && !hasInteraction) {
//       return res.status(403).json({
//         success: false,
//         message: "You can only message users you've liked or who have liked you"
//       });
//     }

//     // Get or create chat room
//     const chatRoom = await getOrCreateChatRoom(currentUserId, userId);

//     // Create message
//     const message = await Message.create({
//       sender: currentUserId,
//       receiver: userId,
//       content,
//       messageType
//     });

//     // Update chat room with last message
//     chatRoom.lastMessage = message._id;
//     chatRoom.lastMessageAt = message.createdAt;

//     // Update message counts
//     const senderCount = chatRoom.messageCounts.find(mc =>
//       mc.user.toString() === currentUserId.toString()
//     );
//     if (senderCount) {
//       senderCount.unreadCount = 0; // Sender's unread count is 0
//     } else {
//       chatRoom.messageCounts.push({
//         user: currentUserId,
//         unreadCount: 0,
//         lastReadMessage: message._id
//       });
//     }

//     const receiverCount = chatRoom.messageCounts.find(mc =>
//       mc.user.toString() === userId.toString()
//     );
//     if (receiverCount) {
//       receiverCount.unreadCount += 1;
//     } else {
//       chatRoom.messageCounts.push({
//         user: userId,
//         unreadCount: 1
//       });
//     }

//     await chatRoom.save();

//     // Create notification for receiver
//     await Notification.create({
//       user: userId,
//       type: "message",
//       title: "New Message",
//       message: `${req.user.name} sent you a message`,
//       data: {
//         senderId: currentUserId,
//         messageId: message._id,
//         chatRoomId: chatRoom._id
//       }
//     });

//     // Populate sender info for response
//     await message.populate("sender", "name profileImage");

//     const baseUrl = `${req.protocol}://${req.get("host")}`;

//     res.status(201).json({
//       success: true,
//       message: "Message sent successfully",
//       data: {
//         _id: message._id,
//         content: message.content,
//         messageType: message.messageType,
//         sender: {
//           _id: message.sender._id,
//           name: message.sender.name,
//           profileImage: message.sender.profileImage ?
//             `${baseUrl}/${message.sender.profileImage}` : null
//         },
//         receiver: userId,
//         createdAt: message.createdAt,
//         isRead: message.isRead
//       }
//     });

//   } catch (error) {
//     console.error("Send message error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while sending message",
//       error: error.message
//     });
//   }
// };

// // Get chat history with a user
// export const getChatHistory = async (req, res) => {
//   try {
//     const currentUserId = req.user._id;
//     const { userId } = req.params;
//     const { page = 1, limit = 50 } = req.query;

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const messages = await Message.find({
//       $or: [
//         { sender: currentUserId, receiver: userId },
//         { sender: userId, receiver: currentUserId }
//       ],
//       isDeleted: false
//     })
//       .populate("sender", "name profileImage")
//       .populate("receiver", "name profileImage")
//       .sort({ createdAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const totalCount = await Message.countDocuments({
//       $or: [
//         { sender: currentUserId, receiver: userId },
//         { sender: userId, receiver: currentUserId }
//       ],
//       isDeleted: false
//     });

//     const baseUrl = `${req.protocol}://${req.get("host")}`;

//     const chatHistory = messages.map(message => ({
//       _id: message._id,
//       content: message.content,
//       messageType: message.messageType,
//       mediaUrl: message.mediaUrl,
//       sender: {
//         _id: message.sender._id,
//         name: message.sender.name,
//         profileImage: message.sender.profileImage ?
//           `${baseUrl}/${message.sender.profileImage}` : null
//       },
//       receiver: {
//         _id: message.receiver._id,
//         name: message.receiver.name,
//         profileImage: message.receiver.profileImage ?
//           `${baseUrl}/${message.receiver.profileImage}` : null
//       },
//       createdAt: message.createdAt,
//       isRead: message.isRead,
//       readAt: message.readAt,
//       reactions: message.reactions
//     }));

//     // Mark messages as read
//     await Message.updateMany(
//       {
//         sender: userId,
//         receiver: currentUserId,
//         isRead: false
//       },
//       {
//         isRead: true,
//         readAt: new Date()
//       }
//     );

//     // Update chat room message counts
//     const chatRoom = await ChatRoom.findOne({
//       participants: { $all: [currentUserId, userId] },
//       isActive: true
//     });

//     if (chatRoom) {
//       const userCount = chatRoom.messageCounts.find(mc =>
//         mc.user.toString() === currentUserId.toString()
//       );
//       if (userCount) {
//         userCount.unreadCount = 0;
//         userCount.lastReadMessage = messages[0]?._id;
//         await chatRoom.save();
//       }
//     }

//     res.status(200).json({
//       success: true,
//       message: "Chat history fetched successfully",
//       data: {
//         messages: chatHistory.reverse(), // Reverse to show oldest first
//         pagination: {
//           currentPage: parseInt(page),
//           totalPages: Math.ceil(totalCount / parseInt(limit)),
//           totalCount,
//           hasNext: skip + parseInt(limit) < totalCount,
//           hasPrev: parseInt(page) > 1
//         }
//       }
//     });

//   } catch (error) {
//     console.error("Get chat history error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching chat history",
//       error: error.message
//     });
//   }
// };

// // Get all chat rooms for current user
// export const getChatRooms = async (req, res) => {
//   try {
//     const currentUserId = req.user._id;
//     const { page = 1, limit = 20 } = req.query;

//     const skip = (parseInt(page) - 1) * parseInt(limit);

//     const chatRooms = await ChatRoom.find({
//       participants: currentUserId,
//       isActive: true
//     })
//       .populate("participants", "name profileImage")
//       .populate("lastMessage")
//       .sort({ lastMessageAt: -1 })
//       .skip(skip)
//       .limit(parseInt(limit));

//     const totalCount = await ChatRoom.countDocuments({
//       participants: currentUserId,
//       isActive: true
//     });

//     const baseUrl = `${req.protocol}://${req.get("host")}`;

//     const rooms = chatRooms.map(room => {
//       const otherParticipant = room.participants.find(p =>
//         p._id.toString() !== currentUserId.toString()
//       );

//       const userCount = room.messageCounts.find(mc =>
//         mc.user.toString() === currentUserId.toString()
//       );

//       return {
//         _id: room._id,
//         otherUser: {
//           _id: otherParticipant._id,
//           name: otherParticipant.name,
//           profileImage: otherParticipant.profileImage ?
//             `${baseUrl}/${otherParticipant.profileImage}` : null
//         },
//         lastMessage: room.lastMessage ? {
//           _id: room.lastMessage._id,
//           content: room.lastMessage.content,
//           messageType: room.lastMessage.messageType,
//           createdAt: room.lastMessage.createdAt
//         } : null,
//         unreadCount: userCount?.unreadCount || 0,
//         lastMessageAt: room.lastMessageAt,
//         createdAt: room.createdAt
//       };
//     });

//     res.status(200).json({
//       success: true,
//       message: "Chat rooms fetched successfully",
//       data: {
//         rooms,
//         pagination: {
//           currentPage: parseInt(page),
//           totalPages: Math.ceil(totalCount / parseInt(limit)),
//           totalCount,
//           hasNext: skip + parseInt(limit) < totalCount,
//           hasPrev: parseInt(page) > 1
//         }
//       }
//     });

//   } catch (error) {
//     console.error("Get chat rooms error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching chat rooms",
//       error: error.message
//     });
//   }
// };

// // Mark messages as read
// export const markMessagesAsRead = async (req, res) => {
//   try {
//     const currentUserId = req.user._id;
//     const { userId } = req.params;

//     const result = await Message.updateMany(
//       {
//         sender: userId,
//         receiver: currentUserId,
//         isRead: false
//       },
//       {
//         isRead: true,
//         readAt: new Date()
//       }
//     );

//     // Update chat room message counts
//     const chatRoom = await ChatRoom.findOne({
//       participants: { $all: [currentUserId, userId] },
//       isActive: true
//     });

//     if (chatRoom) {
//       const userCount = chatRoom.messageCounts.find(mc =>
//         mc.user.toString() === currentUserId.toString()
//       );
//       if (userCount) {
//         userCount.unreadCount = 0;
//         await chatRoom.save();
//       }
//     }

//     res.status(200).json({
//       success: true,
//       message: "Messages marked as read successfully",
//       data: { updatedCount: result.modifiedCount }
//     });

//   } catch (error) {
//     console.error("Mark messages as read error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while marking messages as read",
//       error: error.message
//     });
//   }
// };

// // Delete a message
// export const deleteMessage = async (req, res) => {
//   try {
//     const currentUserId = req.user._id;
//     const { messageId } = req.params;

//     const message = await Message.findOne({
//       _id: messageId,
//       sender: currentUserId
//     });

//     if (!message) {
//       return res.status(404).json({
//         success: false,
//         message: "Message not found or you don't have permission to delete it"
//       });
//     }

//     message.isDeleted = true;
//     message.deletedAt = new Date();
//     await message.save();

//     res.status(200).json({
//       success: true,
//       message: "Message deleted successfully"
//     });

//   } catch (error) {
//     console.error("Delete message error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while deleting message",
//       error: error.message
//     });
//   }
// };

// // Add reaction to message
// export const addMessageReaction = async (req, res) => {
//   try {
//     const currentUserId = req.user._id;
//     const { messageId } = req.params;
//     const { emoji } = req.body;

//     if (!emoji) {
//       return res.status(400).json({
//         success: false,
//         message: "Emoji is required"
//       });
//     }

//     const message = await Message.findOne({
//       _id: messageId,
//       $or: [
//         { sender: currentUserId },
//         { receiver: currentUserId }
//       ]
//     });

//     if (!message) {
//       return res.status(404).json({
//         success: false,
//         message: "Message not found or you don't have access to it"
//       });
//     }

//     // Remove existing reaction from this user
//     message.reactions = message.reactions.filter(
//       reaction => reaction.user.toString() !== currentUserId.toString()
//     );

//     // Add new reaction
//     message.reactions.push({
//       user: currentUserId,
//       emoji,
//       createdAt: new Date()
//     });

//     await message.save();

//     res.status(200).json({
//       success: true,
//       message: "Reaction added successfully"
//     });

//   } catch (error) {
//     console.error("Add message reaction error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while adding reaction",
//       error: error.message
//     });
//   }
// };

// // Get typing status (for real-time updates)
// export const getTypingStatus = async (req, res) => {
//   try {
//     const currentUserId = req.user._id;
//     const { userId } = req.params;

//     const chatRoom = await ChatRoom.findOne({
//       participants: { $all: [currentUserId, userId] },
//       isActive: true
//     });

//     if (!chatRoom) {
//       return res.status(404).json({
//         success: false,
//         message: "Chat room not found"
//       });
//     }

//     const typingUsers = chatRoom.typingUsers.filter(
//       tu => tu.user.toString() !== currentUserId.toString()
//     );

//     res.status(200).json({
//       success: true,
//       message: "Typing status fetched successfully",
//       data: {
//         isTyping: typingUsers.length > 0,
//         typingUsers: typingUsers.map(tu => ({
//           userId: tu.user,
//           startedAt: tu.startedAt
//         }))
//       }
//     });

//   } catch (error) {
//     console.error("Get typing status error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error while fetching typing status",
//       error: error.message
//     });
//   }
// };
import Message from "../models/Message.js";
import ChatRoom from "../models/ChatRoom.js";
import User from "../models/User.js";
import Interaction from "../models/Interaction.js";
import Notification from "../models/Notification.js";

// Helper function to check if users can message each other
const canUsersMessage = async (user1Id, user2Id) => {
  // Check for mutual interest (like or superlike from both sides)
  const user1Interest = await Interaction.findOne({
    fromUser: user1Id,
    toUser: user2Id,
    type: { $in: ["like", "superlike", "interest", "super_interest"] },
    status: "active",
  });

  const user2Interest = await Interaction.findOne({
    fromUser: user2Id,
    toUser: user1Id,
    type: { $in: ["like", "superlike", "interest", "super_interest"] },
    status: "active",
  });

  // Both users must have shown interest
  return !!(user1Interest && user2Interest);
};

// Get or create chat room with a user
const getOrCreateChatRoom = async (user1Id, user2Id) => {
  let chatRoom = await ChatRoom.findOne({
    participants: { $all: [user1Id, user2Id] },
    isActive: true,
  });

  if (!chatRoom) {
    chatRoom = await ChatRoom.create({
      participants: [user1Id, user2Id],
      isActive: true,
      messageCounts: [
        { user: user1Id, unreadCount: 0 },
        { user: user2Id, unreadCount: 0 },
      ],
    });
  }

  return chatRoom;
};

// Send message to a user
export const sendMessage = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;
    const { content, messageType = "text" } = req.body;

    // Validation
    if (!content || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    if (currentUserId.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot send message to yourself",
      });
    }

    // Check if target user exists
    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if users have mutual interest
    const canMessage = await canUsersMessage(currentUserId, userId);

    if (!canMessage) {
      return res.status(403).json({
        success: false,
        message:
          "You can only message users with mutual interest. Both users must like/show interest in each other.",
      });
    }

    // Get or create chat room
    const chatRoom = await getOrCreateChatRoom(currentUserId, userId);

    // Create message
    const message = await Message.create({
      sender: currentUserId,
      receiver: userId,
      content: content.trim(),
      messageType,
    });

    // Update chat room with last message
    chatRoom.lastMessage = message._id;
    chatRoom.lastMessageAt = message.createdAt;

    // Update sender's message count (reset unread)
    const senderCount = chatRoom.messageCounts.find(
      (mc) => mc.user.toString() === currentUserId.toString()
    );
    if (senderCount) {
      senderCount.unreadCount = 0;
      senderCount.lastReadMessage = message._id;
    } else {
      chatRoom.messageCounts.push({
        user: currentUserId,
        unreadCount: 0,
        lastReadMessage: message._id,
      });
    }

    // Update receiver's message count (increment unread)
    const receiverCount = chatRoom.messageCounts.find(
      (mc) => mc.user.toString() === userId.toString()
    );
    if (receiverCount) {
      receiverCount.unreadCount += 1;
    } else {
      chatRoom.messageCounts.push({
        user: userId,
        unreadCount: 1,
      });
    }

    await chatRoom.save();

    // Create notification for receiver
    await Notification.create({
      user: userId,
      type: "message",
      title: "New Message",
      message: `${req.user.name} sent you a message`,
      data: {
        senderId: currentUserId,
        messageId: message._id,
        chatRoomId: chatRoom._id,
      },
    });

    // Populate sender info for response
    await message.populate("sender", "name profileImage");

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: {
        _id: message._id,
        content: message.content,
        messageType: message.messageType,
        sender: {
          _id: message.sender._id,
          name: message.sender.name,
          profileImage: message.sender.profileImage
            ? `${baseUrl}/${message.sender.profileImage}`
            : null,
        },
        receiver: userId,
        createdAt: message.createdAt,
        isRead: message.isRead,
        chatRoomId: chatRoom._id,
      },
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sending message",
      error: error.message,
    });
  }
};

// Get chat history with a user
export const getChatHistory = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Check if users can message each other
    const canMessage = await canUsersMessage(currentUserId, userId);

    if (!canMessage) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this conversation",
      });
    }

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
      isDeleted: false,
    })
      .populate("sender", "name profileImage")
      .populate("receiver", "name profileImage")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await Message.countDocuments({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId },
      ],
      isDeleted: false,
    });

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const chatHistory = messages.map((message) => ({
      _id: message._id,
      content: message.content,
      messageType: message.messageType,
      mediaUrl: message.mediaUrl,
      sender: {
        _id: message.sender._id,
        name: message.sender.name,
        profileImage: message.sender.profileImage
          ? `${baseUrl}/${message.sender.profileImage}`
          : null,
      },
      receiver: {
        _id: message.receiver._id,
        name: message.receiver.name,
        profileImage: message.receiver.profileImage
          ? `${baseUrl}/${message.receiver.profileImage}`
          : null,
      },
      createdAt: message.createdAt,
      isRead: message.isRead,
      readAt: message.readAt,
      reactions: message.reactions,
    }));

    // Mark messages as read
    await Message.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    // Update chat room message counts
    const chatRoom = await ChatRoom.findOne({
      participants: { $all: [currentUserId, userId] },
      isActive: true,
    });

    if (chatRoom) {
      const userCount = chatRoom.messageCounts.find(
        (mc) => mc.user.toString() === currentUserId.toString()
      );
      if (userCount) {
        userCount.unreadCount = 0;
        if (messages.length > 0) {
          userCount.lastReadMessage = messages[0]._id;
        }
        await chatRoom.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Chat history fetched successfully",
      data: {
        messages: chatHistory.reverse(), // Reverse to show oldest first
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          hasNext: skip + parseInt(limit) < totalCount,
          hasPrev: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get chat history error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching chat history",
      error: error.message,
    });
  }
};

// Get all chat rooms for current user (with interests filter)
export const getChatRooms = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { page = 1, limit = 20, onlyWithMessages = false } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get all users who have mutual interest with current user
    const myInterests = await Interaction.find({
      fromUser: currentUserId,
      type: { $in: ["like", "superlike", "interest", "super_interest"] },
      status: "active",
    }).select("toUser");

    const interestedInMe = await Interaction.find({
      toUser: currentUserId,
      type: { $in: ["like", "superlike", "interest", "super_interest"] },
      status: "active",
    }).select("fromUser");

    const myInterestIds = myInterests.map((i) => i.toUser.toString());
    const interestedInMeIds = interestedInMe.map((i) => i.fromUser.toString());

    // Find mutual interests
    const mutualInterestIds = myInterestIds.filter((id) =>
      interestedInMeIds.includes(id)
    );

    if (mutualInterestIds.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No interests with mutual match found",
        data: {
          rooms: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalCount: 0,
            hasNext: false,
            hasPrev: false,
          },
        },
      });
    }

    // Build query for chat rooms
    let chatRoomQuery = {
      participants: currentUserId,
      isActive: true,
    };

    // Filter chat rooms by mutual interests
    chatRoomQuery.participants = {
      $all: [currentUserId],
      $in: mutualInterestIds,
    };

    // If only with messages, find rooms that have last message
    if (onlyWithMessages === "true" || onlyWithMessages === true) {
      chatRoomQuery.lastMessage = { $exists: true, $ne: null };
    }

    const chatRooms = await ChatRoom.find(chatRoomQuery)
      .populate("participants", "name profileImage")
      .populate("lastMessage")
      .sort({ lastMessageAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await ChatRoom.countDocuments(chatRoomQuery);

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const rooms = chatRooms.map((room) => {
      const otherParticipant = room.participants.find(
        (p) => p._id.toString() !== currentUserId.toString()
      );

      const userCount = room.messageCounts.find(
        (mc) => mc.user.toString() === currentUserId.toString()
      );

      return {
        _id: room._id,
        otherUser: {
          _id: otherParticipant._id,
          name: otherParticipant.name,
          profileImage: otherParticipant.profileImage
            ? `${baseUrl}/${otherParticipant.profileImage}`
            : null,
        },
        lastMessage: room.lastMessage
          ? {
              _id: room.lastMessage._id,
              content: room.lastMessage.content,
              messageType: room.lastMessage.messageType,
              sender: room.lastMessage.sender,
              createdAt: room.lastMessage.createdAt,
            }
          : null,
        unreadCount: userCount?.unreadCount || 0,
        lastMessageAt: room.lastMessageAt,
        createdAt: room.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      message: "Chat rooms fetched successfully",
      data: {
        rooms,
        totalMutualInterests: mutualInterestIds.length,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          hasNext: skip + parseInt(limit) < totalCount,
          hasPrev: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get chat rooms error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching chat rooms",
      error: error.message,
    });
  }
};

// Get list of users with mutual interest (for Interests tab)
export const getInterestsList = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { page = 1, limit = 20, withMessages = false } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get mutual interests
    const myInterests = await Interaction.find({
      fromUser: currentUserId,
      type: { $in: ["like", "superlike", "interest", "super_interest"] },
      status: "active",
    }).select("toUser");

    const interestedInMe = await Interaction.find({
      toUser: currentUserId,
      type: { $in: ["like", "superlike", "interest", "super_interest"] },
      status: "active",
    }).select("fromUser");

    const myInterestIds = myInterests.map((i) => i.toUser.toString());
    const interestedInMeIds = interestedInMe.map((i) => i.fromUser.toString());

    let mutualInterestIds = myInterestIds.filter((id) =>
      interestedInMeIds.includes(id)
    );

    // If filtering by messages, only include users with chat rooms
    if (withMessages === "true" || withMessages === true) {
      const chatRooms = await ChatRoom.find({
        participants: currentUserId,
        lastMessage: { $exists: true, $ne: null },
        isActive: true,
      }).select("participants");

      const usersWithMessages = chatRooms.map((room) =>
        room.participants
          .find((p) => p.toString() !== currentUserId.toString())
          .toString()
      );

      mutualInterestIds = mutualInterestIds.filter((id) =>
        usersWithMessages.includes(id)
      );
    }

    // Paginate the mutual interest IDs
    const paginatedIds = mutualInterestIds.slice(skip, skip + parseInt(limit));

    // Fetch user details
    const users = await User.find({
      _id: { $in: paginatedIds },
    }).select("name profileImage age location bio");

    // Get unread message counts for each user
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const usersWithChatInfo = await Promise.all(
      users.map(async (user) => {
        const chatRoom = await ChatRoom.findOne({
          participants: { $all: [currentUserId, user._id] },
          isActive: true,
        }).populate("lastMessage");

        const userCount = chatRoom?.messageCounts.find(
          (mc) => mc.user.toString() === currentUserId.toString()
        );

        return {
          _id: user._id,
          name: user.name,
          profileImage: user.profileImage
            ? `${baseUrl}/${user.profileImage}`
            : null,
          age: user.age,
          location: user.location,
          bio: user.bio,
          lastMessage: chatRoom?.lastMessage
            ? {
                content: chatRoom.lastMessage.content,
                createdAt: chatRoom.lastMessage.createdAt,
                sender: chatRoom.lastMessage.sender,
              }
            : null,
          unreadCount: userCount?.unreadCount || 0,
          chatRoomId: chatRoom?._id,
        };
      })
    );

    res.status(200).json({
      success: true,
      message: "Interests list fetched successfully",
      data: {
        users: usersWithChatInfo,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(mutualInterestIds.length / parseInt(limit)),
          totalCount: mutualInterestIds.length,
          hasNext: skip + parseInt(limit) < mutualInterestIds.length,
          hasPrev: parseInt(page) > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get interests list error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching interests list",
      error: error.message,
    });
  }
};

// Mark messages as read
export const markMessagesAsRead = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;

    const result = await Message.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    // Update chat room message counts
    const chatRoom = await ChatRoom.findOne({
      participants: { $all: [currentUserId, userId] },
      isActive: true,
    });

    if (chatRoom) {
      const userCount = chatRoom.messageCounts.find(
        (mc) => mc.user.toString() === currentUserId.toString()
      );
      if (userCount) {
        userCount.unreadCount = 0;
        await chatRoom.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Messages marked as read successfully",
      data: { updatedCount: result.modifiedCount },
    });
  } catch (error) {
    console.error("Mark messages as read error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while marking messages as read",
      error: error.message,
    });
  }
};

// Delete a message
export const deleteMessage = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { messageId } = req.params;

    const message = await Message.findOne({
      _id: messageId,
      sender: currentUserId,
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found or you don't have permission to delete it",
      });
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    await message.save();

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while deleting message",
      error: error.message,
    });
  }
};

// Add reaction to message
export const addMessageReaction = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: "Emoji is required",
      });
    }

    const message = await Message.findOne({
      _id: messageId,
      $or: [{ sender: currentUserId }, { receiver: currentUserId }],
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found or you don't have access to it",
      });
    }

    // Initialize reactions array if it doesn't exist
    if (!message.reactions) {
      message.reactions = [];
    }

    // Remove existing reaction from this user
    message.reactions = message.reactions.filter(
      (reaction) => reaction.user.toString() !== currentUserId.toString()
    );

    // Add new reaction
    message.reactions.push({
      user: currentUserId,
      emoji,
      createdAt: new Date(),
    });

    await message.save();

    res.status(200).json({
      success: true,
      message: "Reaction added successfully",
      data: {
        reactions: message.reactions,
      },
    });
  } catch (error) {
    console.error("Add message reaction error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding reaction",
      error: error.message,
    });
  }
};
export const getTypingStatus = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const { userId } = req.params;

    const chatRoom = await ChatRoom.findOne({
      participants: { $all: [currentUserId, userId] },
      isActive: true,
    });

    if (!chatRoom) {
      return res.status(404).json({
        success: false,
        message: "Chat room not found",
      });
    }

    const typingUsers = chatRoom.typingUsers.filter(
      (tu) => tu.user.toString() !== currentUserId.toString()
    );

    res.status(200).json({
      success: true,
      message: "Typing status fetched successfully",
      data: {
        isTyping: typingUsers.length > 0,
        typingUsers: typingUsers.map((tu) => ({
          userId: tu.user,
          startedAt: tu.startedAt,
        })),
      },
    });
  } catch (error) {
    console.error("Get typing status error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching typing status",
      error: error.message,
    });
  }
};
