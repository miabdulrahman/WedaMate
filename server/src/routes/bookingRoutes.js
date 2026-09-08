import express from 'express';
import {
  calculateBookingPrice,
  createBooking,
  getBookings,
  getBookingById,
  updateBookingStatus,
  openBookingDispute
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/calculate-price', calculateBookingPrice);
router.post('/', protect, createBooking);
router.get('/', protect, getBookings);
router.get('/:id', protect, getBookingById);
router.patch('/:id/status', protect, updateBookingStatus);
router.post('/:id/dispute', protect, openBookingDispute);

export default router;
