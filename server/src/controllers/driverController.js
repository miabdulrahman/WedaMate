import DriverProfile from '../models/DriverProfile.js';
import User from '../models/User.js';
import Booking from '../models/Booking.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { BOOKING_STATUS, TRANSMISSION_TYPE, VERIFICATION_STATUS } from '../config/constants.js';

export const getDrivers = async (req, res, next) => {
  try {
    const {
      city,
      district,
      transmission, // 'manual', 'automatic', 'both'
      vehicleType,  // 'Car', 'SUV', 'Van', etc.
      minExperience,
      rating,
      verifiedOnly,
      isAvailable,
      maxHourlyRate,
      sort = 'recommended',
      page = 1,
      limit = 12
    } = req.query;

    const filter = {};

    if (transmission) {
      if (transmission === 'manual') {
        filter.transmissionSkills = { $in: [TRANSMISSION_TYPE.MANUAL, TRANSMISSION_TYPE.BOTH] };
      } else if (transmission === 'automatic') {
        filter.transmissionSkills = { $in: [TRANSMISSION_TYPE.AUTOMATIC, TRANSMISSION_TYPE.BOTH] };
      }
    }

    if (vehicleType) {
      filter.vehicleCategoriesCanDrive = { $in: [vehicleType] };
    }

    if (minExperience) {
      filter.drivingExperienceYears = { $gte: parseInt(minExperience) };
    }

    if (verifiedOnly === 'true') {
      filter.licenseVerificationStatus = VERIFICATION_STATUS.VERIFIED;
    }

    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable === 'true';
    }

    if (rating) {
      filter.rating = { $gte: parseFloat(rating) };
    }

    if (maxHourlyRate) {
      filter.hourlyRate = { $lte: parseFloat(maxHourlyRate) };
    }

    if (city) {
      filter['serviceAreas.city'] = { $regex: new RegExp(city, 'i') };
    } else if (district) {
      filter['serviceAreas.district'] = { $regex: new RegExp(district, 'i') };
    }

    let sortOption = {};
    switch (sort) {
      case 'rating':
        sortOption = { rating: -1, reviewCount: -1 };
        break;
      case 'price_low':
        sortOption = { hourlyRate: 1 };
        break;
      case 'price_high':
        sortOption = { hourlyRate: -1 };
        break;
      case 'experience':
        sortOption = { drivingExperienceYears: -1 };
        break;
      case 'jobs':
        sortOption = { completedJobs: -1 };
        break;
      case 'recommended':
      default:
        sortOption = { isAvailable: -1, rating: -1, completedJobs: -1 };
        break;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await DriverProfile.countDocuments(filter);

    const drivers = await DriverProfile.find(filter)
      .populate('user', 'name avatar email phone address status')
      .sort(sortOption)
      .skip(skip)
      .limit(parseInt(limit));

    const activeDrivers = drivers.filter(d => d.user && d.user.status === 'active');

    return sendSuccess(res, 'Drivers retrieved successfully', {
      drivers: activeDrivers,
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

export const getDriverById = async (req, res, next) => {
  try {
    let driver = await DriverProfile.findById(req.params.id).populate(
      'user',
      'name avatar phone address createdAt'
    );

    if (!driver) {
      // Check if ID is a user ID
      driver = await DriverProfile.findOne({ user: req.params.id }).populate(
        'user',
        'name avatar phone address createdAt'
      );

      if (!driver) {
        return sendError(res, 'Driver profile not found', [], 404);
      }
    }

    return sendSuccess(res, 'Driver profile retrieved', { driver });
  } catch (error) {
    next(error);
  }
};

export const updateMyDriverProfile = async (req, res, next) => {
  try {
    let profile = await DriverProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = await DriverProfile.create({
        user: req.user.id,
        ...req.body
      });
    } else {
      Object.assign(profile, req.body);
      await profile.save();
    }

    const populated = await DriverProfile.findById(profile._id).populate('user', 'name avatar phone');
    return sendSuccess(res, 'Driver profile updated successfully', { profile: populated });
  } catch (error) {
    next(error);
  }
};

export const toggleDriverAvailability = async (req, res, next) => {
  try {
    const profile = await DriverProfile.findOne({ user: req.user.id });
    if (!profile) {
      return sendError(res, 'Driver profile not found', [], 404);
    }

    profile.isAvailable = !profile.isAvailable;
    await profile.save();

    return sendSuccess(res, `Availability updated to ${profile.isAvailable ? 'Available' : 'Unavailable'}`, {
      isAvailable: profile.isAvailable
    });
  } catch (error) {
    next(error);
  }
};

export const getDriverDashboardStats = async (req, res, next) => {
  try {
    const driverId = req.user.id;
    const profile = await DriverProfile.findOne({ user: driverId });

    const totalBookings = await Booking.countDocuments({ provider: driverId, bookingType: 'driver' });
    const pendingRequests = await Booking.countDocuments({
      provider: driverId,
      bookingType: 'driver',
      status: BOOKING_STATUS.PENDING
    });
    const upcomingTrips = await Booking.countDocuments({
      provider: driverId,
      bookingType: 'driver',
      status: { $in: [BOOKING_STATUS.ACCEPTED, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.IN_PROGRESS] }
    });
    const completedTrips = await Booking.countDocuments({
      provider: driverId,
      bookingType: 'driver',
      status: BOOKING_STATUS.COMPLETED
    });

    const completedBookings = await Booking.find({
      provider: driverId,
      bookingType: 'driver',
      status: BOOKING_STATUS.COMPLETED
    });

    const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.providerEarnings || 0), 0);

    const recentTrips = await Booking.find({ provider: driverId, bookingType: 'driver' })
      .populate('customer', 'name avatar phone')
      .sort({ scheduledDate: -1 })
      .limit(5);

    return sendSuccess(res, 'Driver dashboard stats retrieved', {
      stats: {
        totalBookings,
        pendingRequests,
        upcomingTrips,
        completedTrips,
        totalEarnings,
        rating: profile ? profile.rating : 5.0,
        drivingSkillScore: profile ? profile.drivingSkillScore : 5.0,
        punctualityScore: profile ? profile.punctualityScore : 5.0,
        reviewCount: profile ? profile.reviewCount : 0,
        isAvailable: profile ? profile.isAvailable : true,
        hourlyRate: profile ? profile.hourlyRate : 1200,
        halfDayRate: profile ? profile.halfDayRate : 5000,
        fullDayRate: profile ? profile.fullDayRate : 9000
      },
      recentTrips
    });
  } catch (error) {
    next(error);
  }
};
