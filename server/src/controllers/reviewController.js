import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import ProviderProfile from '../models/ProviderProfile.js';
import DriverProfile from '../models/DriverProfile.js';
import notificationService from '../services/notificationService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { BOOKING_STATUS, ROLES } from '../config/constants.js';

export const createReview = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { bookingId, rating, comment, subRatings } = req.body;

    if (!bookingId || !rating || !comment) {
      return sendError(res, 'Please provide booking ID, rating (1-5), and written comment', [], 400);
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return sendError(res, 'Booking not found', [], 404);
    }

    if (booking.customer.toString() !== customerId.toString()) {
      return sendError(res, 'You are not authorized to review a booking you did not make', [], 403);
    }

    // Rule: Booking must be in COMPLETED status!
    if (booking.status !== BOOKING_STATUS.COMPLETED) {
      return sendError(
        res,
        `Reviews can only be submitted after the service is marked as completed. Current status: ${booking.status}`,
        ['Booking not completed'],
        400
      );
    }

    // Rule: Prevent duplicate reviews
    const existingReview = await Review.findOne({ booking: bookingId });
    if (existingReview) {
      return sendError(res, 'You have already submitted a review for this booking', ['Duplicate review'], 409);
    }

    const review = await Review.create({
      customer: customerId,
      provider: booking.provider,
      booking: bookingId,
      rating: parseFloat(rating),
      comment,
      subRatings: subRatings || {}
    });

    booking.hasReview = true;
    await booking.save();

    // Recalculate provider aggregate ratings
    const providerReviews = await Review.find({ provider: booking.provider, isHidden: false });
    const avgRating = providerReviews.reduce((sum, r) => sum + r.rating, 0) / providerReviews.length;
    const roundedAvg = Math.round(avgRating * 10) / 10;

    if (booking.bookingType === 'driver') {
      const driverSkillReviews = providerReviews.filter(r => r.subRatings && r.subRatings.drivingSkill);
      const avgDrivingSkill = driverSkillReviews.length > 0
        ? Math.round((driverSkillReviews.reduce((s, r) => s + r.subRatings.drivingSkill, 0) / driverSkillReviews.length) * 10) / 10
        : 5.0;

      await DriverProfile.findOneAndUpdate(
        { user: booking.provider },
        {
          rating: roundedAvg,
          reviewCount: providerReviews.length,
          drivingSkillScore: avgDrivingSkill
        }
      );
    } else {
      await ProviderProfile.findOneAndUpdate(
        { user: booking.provider },
        {
          rating: roundedAvg,
          reviewCount: providerReviews.length
        }
      );
    }

    await notificationService.createNotification({
      recipient: booking.provider,
      sender: customerId,
      type: 'review_received',
      title: 'New Customer Review',
      message: `You received a ${rating}★ review from your client!`,
      link: booking.bookingType === 'driver' ? '/driver/dashboard' : '/provider/dashboard'
    });

    return sendSuccess(res, 'Review submitted successfully', { review }, 201);
  } catch (error) {
    next(error);
  }
};

export const getProviderReviews = async (req, res, next) => {
  try {
    const { providerId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const filter = { provider: providerId, isHidden: false };

    const total = await Review.countDocuments(filter);
    const reviews = await Review.find(filter)
      .populate('customer', 'name avatar address')
      .populate('booking', 'bookingType serviceSnapshot driverDetails scheduledDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return sendSuccess(res, 'Reviews retrieved successfully', {
      reviews,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const moderateReview = async (req, res, next) => {
  try {
    const { isHidden } = req.body;
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isHidden: Boolean(isHidden) },
      { new: true }
    );

    if (!review) {
      return sendError(res, 'Review not found', [], 404);
    }

    return sendSuccess(res, `Review visibility updated to ${isHidden ? 'Hidden' : 'Visible'}`, { review });
  } catch (error) {
    next(error);
  }
};

export const getAllReviews = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isHidden } = req.query;
    const filter = {};
    if (isHidden !== undefined && isHidden !== '') {
      filter.isHidden = isHidden === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Review.countDocuments(filter);
    const reviews = await Review.find(filter)
      .populate('customer', 'name email avatar')
      .populate('provider', 'name email avatar')
      .populate('booking', 'bookingType serviceSnapshot driverDetails scheduledDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return sendSuccess(res, 'All reviews retrieved successfully', {
      reviews,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

