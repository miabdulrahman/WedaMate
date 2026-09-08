import express from 'express';
import {
  processBookingPayment,
  getPaymentHistory
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/checkout', protect, processBookingPayment);
router.get('/history', protect, getPaymentHistory);

export default router;
