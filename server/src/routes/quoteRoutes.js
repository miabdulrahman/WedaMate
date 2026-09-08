import express from 'express';
import {
  requestQuote,
  getQuotes,
  respondQuote,
  acceptQuote,
  rejectQuote
} from '../controllers/quoteController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, requestQuote);
router.get('/', protect, getQuotes);
router.post('/:id/respond', protect, respondQuote);
router.post('/:id/accept', protect, acceptQuote);
router.post('/:id/reject', protect, rejectQuote);

export default router;
