import express from 'express';
import {
  getConversations,
  startDirectConversation,
  getOrCreateBookingConversation,
  getMessages,
  sendMessage
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.post('/start', protect, startDirectConversation);
router.post('/direct/:recipientId', protect, (req, res, next) => {
  req.body.recipientId = req.params.recipientId;
  return startDirectConversation(req, res, next);
});
router.get('/booking/:bookingId', protect, getOrCreateBookingConversation);
router.get('/conversations/:conversationId', protect, getMessages);
router.post('/conversations/:conversationId', protect, sendMessage);

export default router;
