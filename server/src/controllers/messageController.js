import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Booking from '../models/Booking.js';
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

export const getOrCreateBookingConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return sendError(res, 'Booking not found', [], 404);
    }

    // Check if current user is customer or provider
    const isParticipant =
      booking.customer.toString() === userId || booking.provider.toString() === userId;
    if (!isParticipant) {
      return sendError(res, 'Not authorized to access messages for this booking', [], 403);
    }

    let conversation = await Conversation.findOne({ booking: bookingId })
      .populate('participants', 'name avatar role')
      .populate('booking', 'bookingType serviceSnapshot status scheduledDate');

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [booking.customer, booking.provider],
        booking: bookingId,
        lastMessage: 'Conversation opened',
        lastMessageAt: new Date()
      });

      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name avatar role')
        .populate('booking', 'bookingType serviceSnapshot status scheduledDate');
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

    if (!conversation.participants.some(p => p.toString() === userId)) {
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

    await notificationService.createNotification({
      recipient: receiverId,
      sender: senderId,
      type: 'new_message',
      title: `New message from ${req.user.name}`,
      message: text ? text.slice(0, 60) : 'Sent you an attachment.',
      link: '/messages'
    });

    const populated = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('receiver', 'name avatar');

    return sendSuccess(res, 'Message sent successfully', { message: populated }, 201);
  } catch (error) {
    next(error);
  }
};
