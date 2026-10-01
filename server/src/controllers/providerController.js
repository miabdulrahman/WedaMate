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

    const andConditions = [];

    if (category) {
      let catDoc = null;
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        catDoc = await Category.findById(category);
      }
      if (!catDoc) {
        catDoc = await Category.findOne({ slug: category });
      }
      if (!catDoc) {
        catDoc = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
      }

      if (catDoc) {
        const subcategoryNames = (catDoc.subcategories || []).map((s) => s.name);
        const searchTerms = [catDoc.name, ...subcategoryNames];
        const regexPatterns = searchTerms.map((term) => new RegExp(term, 'i'));

        andConditions.push({
          $or: [
            { categories: catDoc._id },
            { 'services.category': catDoc._id },
            { 'services.categoryName': { $regex: catDoc.name, $options: 'i' } },
            { profession: { $in: regexPatterns } },
            { subcategories: { $in: searchTerms } }
          ]
        });
      } else {
        andConditions.push({
          $or: [
            { profession: { $regex: category, $options: 'i' } },
            { subcategories: { $regex: category, $options: 'i' } },
            { 'services.title': { $regex: category, $options: 'i' } }
          ]
        });
      }
    }

    if (verifiedOnly === 'true') {
      andConditions.push({ verificationStatus: VERIFICATION_STATUS.VERIFIED });
    }

    if (rating) {
      andConditions.push({ rating: { $gte: parseFloat(rating) } });
    }

    if (city) {
      andConditions.push({ 'serviceAreas.city': { $regex: new RegExp(city, 'i') } });
    } else if (district) {
      andConditions.push({ 'serviceAreas.district': { $regex: new RegExp(district, 'i') } });
    }

    if (search) {
      andConditions.push({
        $or: [
          { profession: { $regex: search, $options: 'i' } },
          { businessName: { $regex: search, $options: 'i' } },
          { bio: { $regex: search, $options: 'i' } },
          { subcategories: { $regex: search, $options: 'i' } },
          { 'services.title': { $regex: search, $options: 'i' } }
        ]
      });
    }

    const filter = andConditions.length > 0 ? { $and: andConditions } : {};

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

export const getMyProviderProfile = async (req, res, next) => {
  try {
    let profile = await ProviderProfile.findOne({ user: req.user.id })
      .populate('user', 'name avatar phone email address createdAt')
      .populate('categories', 'name slug icon subcategories')
      .populate('services.category', 'name slug icon');

    if (!profile) {
      profile = await ProviderProfile.create({
        user: req.user.id,
        profession: 'Service Provider',
        businessName: `${req.user.name}'s Services`,
        serviceAreas: [{ city: req.user.address?.city || 'Colombo', district: req.user.address?.district || 'Colombo' }],
        startingPrice: 2500
      });
      profile = await ProviderProfile.findById(profile._id)
        .populate('user', 'name avatar phone email address createdAt');
    }

    return sendSuccess(res, 'Provider profile retrieved successfully', { profile });
  } catch (error) {
    next(error);
  }
};

export const addProviderService = async (req, res, next) => {
  try {
    const { title, category, categoryName, description, price, durationHours, pricingType, image } = req.body;
    if (!title || !price) {
      return sendError(res, 'Please provide service title and price', [], 400);
    }

    let profile = await ProviderProfile.findOne({ user: req.user.id });
    if (!profile) {
      profile = await ProviderProfile.create({
        user: req.user.id,
        profession: title,
        serviceAreas: [{ city: req.user.address?.city || 'Colombo', district: req.user.address?.district || 'Colombo' }]
      });
    }

    const newService = {
      title,
      category: category || null,
      categoryName: categoryName || '',
      description: description || '',
      price: parseFloat(price) || 2500,
      durationHours: parseInt(durationHours) || 2,
      pricingType: pricingType || 'fixed',
      image: image || '',
      isActive: true
    };

    profile.services.push(newService);
    if (category && (!profile.categories || !profile.categories.map((c) => c.toString()).includes(category.toString()))) {
      profile.categories = profile.categories || [];
      profile.categories.push(category);
    }
    await profile.save();

    const createdService = profile.services[profile.services.length - 1];
    return sendSuccess(res, 'Service added successfully', { service: createdService, services: profile.services }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateProviderService = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const profile = await ProviderProfile.findOne({ user: req.user.id });
    if (!profile) {
      return sendError(res, 'Provider profile not found', [], 404);
    }

    const service = profile.services.id(serviceId);
    if (!service) {
      return sendError(res, 'Service not found in provider profile', [], 404);
    }

    Object.assign(service, req.body);
    if (req.body.category && (!profile.categories || !profile.categories.map((c) => c.toString()).includes(req.body.category.toString()))) {
      profile.categories = profile.categories || [];
      profile.categories.push(req.body.category);
    }
    await profile.save();

    return sendSuccess(res, 'Service updated successfully', { service, services: profile.services });
  } catch (error) {
    next(error);
  }
};

export const deleteProviderService = async (req, res, next) => {
  try {
    const { serviceId } = req.params;
    const profile = await ProviderProfile.findOne({ user: req.user.id });
    if (!profile) {
      return sendError(res, 'Provider profile not found', [], 404);
    }

    profile.services = profile.services.filter((s) => s._id.toString() !== serviceId.toString());
    await profile.save();

    return sendSuccess(res, 'Service deleted successfully', { services: profile.services });
  } catch (error) {
    next(error);
  }
};

