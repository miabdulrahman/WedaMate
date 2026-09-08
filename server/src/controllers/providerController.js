import ProviderProfile from '../models/ProviderProfile.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import Category from '../models/Category.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { BOOKING_STATUS, VERIFICATION_STATUS } from '../config/constants.js';

export const getProviders = async (req, res, next) => {
  try {
    const {
      search,
      category,
      city,
      district,
      rating,
      verifiedOnly,
      sort = 'recommended',
      page = 1,
      limit = 12
    } = req.query;

    const filter = {};

    if (category) {
      const catDoc = await Category.findOne({ slug: category });
      if (catDoc) {
        filter.categories = catDoc._id;
      }
    }

    if (verifiedOnly === 'true') {
      filter.verificationStatus = VERIFICATION_STATUS.VERIFIED;
    }

    if (rating) {
      filter.rating = { $gte: parseFloat(rating) };
    }

    if (city) {
      filter['serviceAreas.city'] = { $regex: new RegExp(city, 'i') };
    } else if (district) {
      filter['serviceAreas.district'] = { $regex: new RegExp(district, 'i') };
    }

    if (search) {
      filter.$or = [
        { profession: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { subcategories: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = {};
    switch (sort) {
      case 'rating':
        sortOption = { rating: -1, reviewCount: -1 };
        break;
      case 'price_low':
        sortOption = { startingPrice: 1 };
        break;
      case 'price_high':
        sortOption = { startingPrice: -1 };
        break;
      case 'jobs':
        sortOption = { jobsCompleted: -1 };
        break;
      case 'recommended':
      default:
        sortOption = { featured: -1, rating: -1, jobsCompleted: -1 };
        break;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await ProviderProfile.countDocuments(filter);

    const providers = await ProviderProfile.find(filter)
      .populate('user', 'name avatar email phone address status')
      .populate('categories', 'name slug icon')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    // Filter out inactive/suspended users
    const activeProviders = providers.filter(p => p.user && p.user.status === 'active');

    return sendSuccess(res, 'Providers retrieved successfully', {
      providers: activeProviders,
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

export const getProviderById = async (req, res, next) => {
  try {
    const provider = await ProviderProfile.findById(req.params.id)
      .populate('user', 'name avatar phone address createdAt')
      .populate('categories', 'name slug icon subcategories');

    if (!provider) {
      // Check if ID is a user ID instead
      const providerByUser = await ProviderProfile.findOne({ user: req.params.id })
        .populate('user', 'name avatar phone address createdAt')
        .populate('categories', 'name slug icon subcategories');

      if (!providerByUser) {
        return sendError(res, 'Provider profile not found', [], 404);
      }
      return sendSuccess(res, 'Provider profile retrieved', { provider: providerByUser });
    }

    return sendSuccess(res, 'Provider profile retrieved', { provider });
  } catch (error) {
    next(error);
  }
};

export const updateMyProviderProfile = async (req, res, next) => {
  try {
    let profile = await ProviderProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = await ProviderProfile.create({
        user: req.user.id,
        ...req.body
      });
    } else {
      Object.assign(profile, req.body);
      await profile.save();
    }

    const populated = await ProviderProfile.findById(profile._id)
      .populate('user', 'name avatar phone')
      .populate('categories', 'name slug icon');

    return sendSuccess(res, 'Provider profile updated successfully', { profile: populated });
  } catch (error) {
    next(error);
  }
};

export const getProviderDashboardStats = async (req, res, next) => {
  try {
    const providerId = req.user.id;
    const profile = await ProviderProfile.findOne({ user: providerId });

    const totalBookings = await Booking.countDocuments({ provider: providerId });
    const pendingRequests = await Booking.countDocuments({
      provider: providerId,
      status: BOOKING_STATUS.PENDING
    });
    const upcomingJobs = await Booking.countDocuments({
      provider: providerId,
      status: { $in: [BOOKING_STATUS.ACCEPTED, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.IN_PROGRESS] }
    });
    const completedJobs = await Booking.countDocuments({
      provider: providerId,
      status: BOOKING_STATUS.COMPLETED
    });

    const completedBookings = await Booking.find({
      provider: providerId,
      status: BOOKING_STATUS.COMPLETED
    });

    const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.providerEarnings || 0), 0);

    // Recent 5 bookings
    const recentBookings = await Booking.find({ provider: providerId })
      .populate('customer', 'name avatar phone')
      .populate('service', 'title icon')
      .sort({ scheduledDate: -1 })
      .limit(5);

    return sendSuccess(res, 'Provider dashboard stats retrieved', {
      stats: {
        totalBookings,
        pendingRequests,
        upcomingJobs,
        completedJobs,
        totalEarnings,
        rating: profile ? profile.rating : 5.0,
        reviewCount: profile ? profile.reviewCount : 0,
        completionRate: profile ? profile.completionRate : 98,
        responseTimeMinutes: profile ? profile.responseTimeMinutes : 15
      },
      recentBookings
    });
  } catch (error) {
    next(error);
  }
};
