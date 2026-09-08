import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import paymentService from '../services/paymentService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { BOOKING_STATUS, PAYMENT_STATUS, ROLES } from '../config/constants.js';

export const processBookingPayment = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { bookingId, paymentMethod = 'Direct Pay (Mock / PayHere Gateway)' } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return sendError(res, 'Booking not found', [], 404);
    }

    if (booking.customer.toString() !== customerId.toString()) {
      return sendError(res, 'Not authorized to pay for this booking', [], 403);
    }

    if (booking.paymentStatus === PAYMENT_STATUS.PAID) {
      return sendError(res, 'This booking has already been paid for', [], 400);
    }

    const payment = await paymentService.processPayment({
      bookingId: booking._id,
      customerId,
      providerId: booking.provider,
      amount: booking.totalAmount,
      paymentMethod
    });

    booking.paymentStatus = PAYMENT_STATUS.PAID;
    if (booking.status === BOOKING_STATUS.PENDING) {
      booking.status = BOOKING_STATUS.ACCEPTED;
      booking.statusTimeline.push({
        status: BOOKING_STATUS.ACCEPTED,
        timestamp: new Date(),
        note: 'Payment authorized; booking accepted',
        updatedBy: customerId
      });
    }
    await booking.save();

    return sendSuccess(res, 'Payment processed successfully', { payment, booking });
  } catch (error) {
    next(error);
  }
};

export const getPaymentHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;

    const filter = {};
    if (role === ROLES.ADMIN) {
      // Admin sees all
    } else if (role === ROLES.PROVIDER || role === ROLES.DRIVER) {
      filter.provider = userId;
    } else {
      filter.customer = userId;
    }

    const payments = await Payment.find(filter)
      .populate('booking', 'bookingType serviceSnapshot status scheduledDate')
      .populate('customer', 'name email')
      .populate('provider', 'name email')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Payment history retrieved', { payments });
  } catch (error) {
    next(error);
  }
};
