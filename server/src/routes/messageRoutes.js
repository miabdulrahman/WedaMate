import express from 'express';
import {
  getConversations,
  getOrCreateBookingConversation,
  getMessages,
  sendMessage
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/booking/:bookingId', protect, getOrCreateBookingConversation);
router.get('/conversations/:conversationId', protect, getMessages);
router.post('/conversations/:conversationId', protect, sendMessage);

export default router;
