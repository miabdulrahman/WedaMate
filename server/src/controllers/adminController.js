import User from '../models/User.js';
import ProviderProfile from '../models/ProviderProfile.js';
import DriverProfile from '../models/DriverProfile.js';
import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import PlatformSettings from '../models/PlatformSettings.js';
import Service from '../models/Service.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { BOOKING_STATUS, ROLES, VERIFICATION_STATUS } from '../config/constants.js';

export const getAdminAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const customerCount = await User.countDocuments({ role: ROLES.CUSTOMER });
    const activeProviders = await ProviderProfile.countDocuments({ verificationStatus: VERIFICATION_STATUS.VERIFIED });
    const verifiedDrivers = await DriverProfile.countDocuments({ licenseVerificationStatus: VERIFICATION_STATUS.VERIFIED });

    const totalBookings = await Booking.countDocuments();
    const completedBookings = await Booking.countDocuments({ status: BOOKING_STATUS.COMPLETED });
    const pendingBookings = await Booking.countDocuments({ status: BOOKING_STATUS.PENDING });
    const cancelledBookings = await Booking.countDocuments({ status: BOOKING_STATUS.CANCELLED });
    const driverBookings = await Booking.countDocuments({ bookingType: 'driver' });
    const serviceBookings = await Booking.countDocuments({ bookingType: 'service' });

    // Financial calculations from completed/paid bookings
    const allCompleted = await Booking.find({
      status: { $in: [BOOKING_STATUS.COMPLETED, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.IN_PROGRESS] }
    });

    const grossBookingValue = allCompleted.reduce((acc, b) => acc + (b.totalAmount || 0), 0);
    const platformRevenue = allCompleted.reduce((acc, b) => acc + (b.platformFee || 0), 0);

    // Bookings and Revenue grouped by recent period
    const recentBookings = await Booking.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          volume: { $sum: '$totalAmount' },
          revenue: { $sum: '$platformFee' }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 14 }
    ]);

    // Popular services aggregation
    const popularServices = await Booking.aggregate([
      { $match: { bookingType: 'service', serviceSnapshot: { $exists: true } } },
      {
        $group: {
          _id: '$serviceSnapshot.title',
          bookingsCount: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { bookingsCount: -1 } },
      { $limit: 6 }
    ]);

    return sendSuccess(res, 'Admin analytics retrieved successfully', {
      metrics: {
        totalUsers,
        customerCount,
        activeProviders,
        verifiedDrivers,
        totalBookings,
        completedBookings,
        pendingBookings,
        cancelledBookings,
        driverBookings,
        serviceBookings,
        grossBookingValue,
        platformRevenue,
        completionRate: totalBookings > 0 ? Math.round((completedBookings / totalBookings) * 100) : 100
      },
      trends: recentBookings.reverse(),
      popularServices
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminUsers = async (req, res, next) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .populate('providerProfile driverProfile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return sendSuccess(res, 'Users retrieved', {
      users,
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

export const toggleUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return sendError(res, 'User not found', [], 404);
    }

    user.status = user.status === 'active' ? 'suspended' : 'active';
    await user.save();

    return sendSuccess(res, `User status updated to ${user.status}`, { user });
  } catch (error) {
    next(error);
  }
};

export const getSettings = async (req, res, next) => {
  try {
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = await PlatformSettings.create({
        commissionPercentage: 10,
        baseServiceFee: 250,
        driverHourlyMinRate: 800
      });
    }
    return sendSuccess(res, 'Platform settings retrieved', { settings });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    let settings = await PlatformSettings.findOne();
    if (!settings) {
      settings = await PlatformSettings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    return sendSuccess(res, 'Platform settings updated successfully', { settings });
  } catch (error) {
    next(error);
  }
};
