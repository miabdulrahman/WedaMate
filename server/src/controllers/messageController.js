import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import ProviderProfile from '../models/ProviderProfile.js';
import notificationService from '../services/notificationService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({
      participants: userId
    })
      .populate('participants', 'name avatar role')
      .populate('booking', 'bookingType serviceSnapshot status scheduledDate')
      .sort({ lastMessageAt: -1 });

    return sendSuccess(res, 'Conversations retrieved successfully', { conversations });
  } catch (error) {
    next(error);
  }
};

export const startDirectConversation = async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const { recipientId, initialMessage } = req.body;

    if (!recipientId) {
      return sendError(res, 'Recipient ID is required', [], 400);
    }

    let targetUserId = recipientId;
    let targetUser = await User.findById(recipientId);

    // If recipient is a ProviderProfile ID, look up its user
    if (!targetUser) {
      const profile = await ProviderProfile.findById(recipientId);
      if (profile && profile.user) {
        targetUserId = profile.user.toString();
        targetUser = await User.findById(targetUserId);
      }
    }

    if (!targetUser) {
      return sendError(res, 'Recipient user not found', [], 404);
    }

    if (targetUserId.toString() === senderId.toString()) {
      return sendError(res, 'You cannot message yourself', [], 400);
    }

    // Find existing direct conversation between sender and target
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, targetUserId] }
    })
      .populate('participants', 'name avatar role')
      .populate('booking', 'bookingType serviceSnapshot status scheduledDate');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, targetUserId],
        lastMessage: initialMessage || 'Conversation started',
        lastMessageAt: new Date()
      });

      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name avatar role')
        .populate('booking', 'bookingType serviceSnapshot status scheduledDate');
    }

    // If an initial message was provided, create and send it
    if (initialMessage && initialMessage.trim()) {
      const message = await Message.create({
        conversation: conversation._id,
        sender: senderId,
        receiver: targetUserId,
        text: initialMessage.trim(),
        read: false
      });

      conversation.lastMessage = initialMessage.trim();
      conversation.lastMessageAt = new Date();
      await conversation.save();

      await notificationService.createNotification({
        recipient: targetUserId,
        sender: senderId,
        type: 'new_message',
        title: `New message from ${req.user.name}`,
        message: initialMessage.trim().slice(0, 60),
        link: '/messages'
      });
    }

    return sendSuccess(res, 'Conversation ready', { conversation }, 200);
  } catch (error) {
    next(error);
  }
};

export const getOrCreateBookingConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return sendError(res, 'Booking not found', [], 404);
    }

    // Check if current user is customer, provider, or admin
    const isParticipant =
      booking.customer?.toString() === userId.toString() ||
      booking.provider?.toString() === userId.toString() ||
      req.user.role === 'admin';
    if (!isParticipant) {
      return sendError(res, 'Not authorized to access messages for this booking', [], 403);
    }

    let conversation = await Conversation.findOne({ booking: bookingId })
      .populate('participants', 'name avatar role phone')
      .populate('booking', 'bookingType serviceSnapshot status scheduledDate startTime totalAmount');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [booking.customer, booking.provider],
        booking: bookingId,
        lastMessage: 'Conversation opened for booking',
        lastMessageAt: new Date()
      });

      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name avatar role phone')
        .populate('booking', 'bookingType serviceSnapshot status scheduledDate startTime totalAmount');
    }

    return sendSuccess(res, 'Conversation retrieved', { conversation });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return sendError(res, 'Conversation not found', [], 404);
    }

    if (!conversation.participants.some(p => p.toString() === userId) && req.user.role !== 'admin') {
      return sendError(res, 'Not authorized to view messages in this conversation', [], 403);
    }

    const messages = await Message.find({ conversation: conversationId })
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar')
      .sort({ createdAt: 1 });

    // Mark unread messages addressed to current user as read
    await Message.updateMany(
      { conversation: conversationId, receiver: userId, read: false },
      { read: true }
    );

    return sendSuccess(res, 'Messages retrieved successfully', { messages });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const { conversationId } = req.params;
    const { text, attachment } = req.body;

    if (!text && !attachment) {
      return sendError(res, 'Message text or attachment is required', [], 400);
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return sendError(res, 'Conversation not found', [], 404);
    }

    const receiverId = conversation.participants.find(p => p.toString() !== senderId);
    if (!receiverId) {
      return sendError(res, 'Invalid recipient', [], 400);
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      receiver: receiverId,
      text: text || '',
      attachment: attachment || '',
      read: false
    });

    conversation.lastMessage = text || 'Sent an attachment';
    conversation.lastMessageAt = new Date();
    await conversation.save();

    // Determine receiver role to build appropriate in-app route link
    const receiverUser = await User.findById(receiverId).select('role name');
    const receiverRole = receiverUser?.role || 'customer';
    let link = `/messages?conversationId=${conversationId}`;
    if (receiverRole === 'provider') {
      link = `/provider/messages?conversationId=${conversationId}`;
    } else if (receiverRole === 'driver') {
      link = `/driver/messages?conversationId=${conversationId}`;
    }

    await notificationService.createNotification({
      recipient: receiverId,
      sender: senderId,
      type: 'new_message',
      title: `New message from ${req.user.name}`,
      message: text ? text.slice(0, 80) : 'Sent you an attachment.',
      link
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    return sendSuccess(res, 'Message sent successfully', { message: populated }, 201);
  } catch (error) {
    next(error);
  }
};
