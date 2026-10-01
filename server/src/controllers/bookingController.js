import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Service from '../models/Service.js';
import DriverProfile from '../models/DriverProfile.js';
import ProviderProfile from '../models/ProviderProfile.js';
import paymentService from '../services/paymentService.js';
import notificationService from '../services/notificationService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { BOOKING_STATUS, PAYMENT_STATUS, ROLES } from '../config/constants.js';

export const calculateBookingPrice = async (req, res, next) => {
  try {
    const { bookingType, serviceId, providerId, driverId, rateType = 'hourly', durationHours = 2 } = req.body;

    let baseAmount = 0;

    if (bookingType === 'driver') {
      const driver = await DriverProfile.findOne({
        $or: [{ _id: driverId || providerId }, { user: driverId || providerId }]
      });

      if (!driver) {
        return sendError(res, 'Driver profile not found', [], 404);
      }

      if (rateType === 'half_day') {
        baseAmount = driver.halfDayRate || 5000;
      } else if (rateType === 'full_day') {
        baseAmount = driver.fullDayRate || 9000;
      } else {
        baseAmount = (driver.hourlyRate || 1200) * Math.max(1, parseInt(durationHours));
      }
    } else {
      let foundService = null;
      if (serviceId) {
        foundService = await Service.findById(serviceId);
      }

      if (foundService) {
        baseAmount = foundService.basePrice;
      } else if (providerId) {
        const provider = await ProviderProfile.findOne({
          $or: [{ _id: providerId }, { user: providerId }]
        });
        if (provider) {
          const customSvc = provider.services?.id(serviceId);
          if (customSvc) {
            baseAmount = customSvc.price;
          } else {
            baseAmount = (provider.startingPrice || 2500) * Math.max(1, parseInt(durationHours || 1));
          }
        }
      }

      if (!baseAmount) {
        baseAmount = 2500;
      }
    }

    const feeCalculation = await paymentService.calculateFees(baseAmount);
    return sendSuccess(res, 'Pricing breakdown calculated', feeCalculation);
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const {
      providerId,
      bookingType = 'service',
      serviceId,
      scheduledDate,
      startTime,
      durationHours = 2,
      location,
      driverDetails,
      notes
    } = req.body;

    if (!providerId || !scheduledDate || !startTime || !location || !location.address) {
      return sendError(res, 'Please provide provider, scheduled date, start time, and location address', [], 400);
    }

    // Resolve provider User ID (in case caller passed ProviderProfile._id or DriverProfile._id)
    let providerUserId = providerId;
    const providerUser = await User.findById(providerId);
    if (!providerUser) {
      const pProfile = await ProviderProfile.findById(providerId);
      if (pProfile) {
        providerUserId = pProfile.user;
      } else {
        const dProfile = await DriverProfile.findById(providerId);
        if (dProfile) {
          providerUserId = dProfile.user;
        } else {
          return sendError(res, 'Provider or driver account not found', [], 404);
        }
      }
    }

    const dateObj = new Date(scheduledDate);
    const startOfDay = new Date(dateObj);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateObj);
    endOfDay.setHours(23, 59, 59, 999);

    // Double-booking check: verify provider doesn't already have an active booking at the same date & time slot
    const existingConflict = await Booking.findOne({
      provider: providerUserId,
      scheduledDate: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      startTime,
      status: { $in: [BOOKING_STATUS.PENDING, BOOKING_STATUS.ACCEPTED, BOOKING_STATUS.CONFIRMED, BOOKING_STATUS.IN_PROGRESS] }
    });

    if (existingConflict) {
      return sendError(
        res,
        'This provider/driver already has a scheduled booking for this date and time slot. Please choose another slot.',
        ['Double booking conflict'],
        409
      );
    }

    let price = 0;
    let serviceSnapshot = {};
    let resolvedServiceId = null;

    if (bookingType === 'driver') {
      const driver = await DriverProfile.findOne({
        $or: [{ _id: providerId }, { user: providerUserId }]
      });

      if (!driver) {
        return sendError(res, 'Driver not found', [], 404);
      }

      const rateType = driverDetails?.rateType || 'hourly';
      if (rateType === 'half_day') {
        price = driver.halfDayRate || 5000;
      } else if (rateType === 'full_day') {
        price = driver.fullDayRate || 9000;
      } else {
        price = (driver.hourlyRate || 1200) * Math.max(1, parseInt(durationHours));
      }
      serviceSnapshot = {
        title: 'Drive My Vehicle',
        categoryName: 'Driver Service',
        pricingType: rateType,
        unitPrice: price
      };
    } else {
      let foundService = null;
      if (serviceId) {
        foundService = await Service.findById(serviceId).populate('category', 'name');
      }

      const pProfile = await ProviderProfile.findOne({ user: providerUserId }).populate('categories', 'name');

      if (foundService) {
        resolvedServiceId = foundService._id;
        price = foundService.basePrice;
        serviceSnapshot = {
          title: foundService.title,
          categoryName: foundService.category?.name || 'Local Service',
          pricingType: foundService.pricingType,
          unitPrice: foundService.basePrice
        };
      } else if (pProfile) {
        const customSvc = pProfile.services?.id(serviceId);
        if (customSvc) {
          price = customSvc.price;
          serviceSnapshot = {
            title: customSvc.title,
            categoryName: pProfile.categories?.[0]?.name || 'Local Service',
            pricingType: customSvc.pricingType || 'fixed',
            unitPrice: customSvc.price
          };
        } else {
          price = (pProfile.startingPrice || 2500) * Math.max(1, parseInt(durationHours || 1));
          serviceSnapshot = {
            title: pProfile.profession || pProfile.businessName || 'Service Booking',
            categoryName: pProfile.categories?.[0]?.name || 'Home Services',
            pricingType: pProfile.pricingType || 'quote_based',
            unitPrice: pProfile.startingPrice || 2500
          };
        }
      } else {
        price = 2500;
        serviceSnapshot = {
          title: 'Home Service',
          categoryName: 'General',
          pricingType: 'fixed',
          unitPrice: 2500
        };
      }
    }

    const fees = await paymentService.calculateFees(price);

    const booking = await Booking.create({
      customer: customerId,
      provider: providerUserId,
      bookingType,
      service: resolvedServiceId,
      serviceSnapshot,
      driverDetails: driverDetails || {},
      location,
      scheduledDate: dateObj,
      startTime,
      durationHours,
      price,
      additionalFees: 0,
      platformFee: fees.platformFee,
      totalAmount: fees.customerTotal,
      providerEarnings: fees.providerEarnings,
      paymentStatus: PAYMENT_STATUS.PENDING,
      status: BOOKING_STATUS.PENDING,
      notes: notes || '',
      statusTimeline: [
        {
          status: BOOKING_STATUS.PENDING,
          timestamp: new Date(),
          note: 'Booking requested by customer',
          updatedBy: customerId
        }
      ]
    });

    // Notify provider
    const customer = await User.findById(customerId);
    const bookingTitle = bookingType === 'driver' ? 'Drive My Vehicle Request' : (serviceSnapshot.title || 'Service Booking');
    await notificationService.createNotification({
      recipient: providerUserId,
      sender: customerId,
      type: 'booking_request',
      title: `New Booking Request: ${bookingTitle}`,
      message: `${customer?.name || 'A customer'} has requested a booking for ${new Date(scheduledDate).toLocaleDateString()} at ${startTime}.`,
      link: bookingType === 'driver' ? `/driver/bookings` : `/provider/bookings`
    });

    const populated = await Booking.findById(booking._id)
      .populate('customer', 'name phone email avatar address')
      .populate('provider', 'name phone email avatar')
      .populate('service', 'title icon image');

    return sendSuccess(res, 'Booking requested successfully', { booking: populated }, 201);
  } catch (error) {
    next(error);
  }
};

export const getBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const { status, type, page = 1, limit = 20 } = req.query;

    const filter = {};

    if (role === ROLES.ADMIN) {
      // Admin sees all
    } else if (role === ROLES.PROVIDER || role === ROLES.DRIVER) {
      filter.provider = userId;
    } else {
      filter.customer = userId;
    }

    if (status) {
      filter.status = status;
    }

    if (type) {
      filter.bookingType = type;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Booking.countDocuments(filter);

    const bookings = await Booking.find(filter)
      .populate('customer', 'name phone email avatar address')
      .populate('provider', 'name phone email avatar')
      .populate('service', 'title icon image')
      .sort({ scheduledDate: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    return sendSuccess(res, 'Bookings retrieved successfully', {
      bookings,
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

export const getBookingById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return sendError(res, 'Invalid booking ID format', [], 400);
    }

    const booking = await Booking.findById(req.params.id)
      .populate('customer', 'name phone email avatar address')
      .populate('provider', 'name phone email avatar address')
      .populate('service', 'title icon image description pricingType')
      .populate('cancelledBy', 'name');

    if (!booking) {
      return sendError(res, 'Booking not found', [], 404);
    }

    // Access control: customer, provider, or admin only
    const userId = req.user.id.toString();
    const customerId = (booking.customer?._id || booking.customer)?.toString();
    const providerId = (booking.provider?._id || booking.provider)?.toString();

    const isAuthorized =
      customerId === userId ||
      providerId === userId ||
      req.user.role === ROLES.ADMIN;

    if (!isAuthorized) {
      return sendError(res, 'Not authorized to view this booking', [], 403);
    }

    return sendSuccess(res, 'Booking retrieved successfully', { booking });
  } catch (error) {
    next(error);
  }
};

export const updateBookingStatus = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return sendError(res, 'Invalid booking ID format', [], 400);
    }

    const { status, note, cancellationReason } = req.body;
    const userId = req.user.id.toString();
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return sendError(res, 'Booking not found', [], 404);
    }

    const customerId = (booking.customer?._id || booking.customer)?.toString();
    const providerId = (booking.provider?._id || booking.provider)?.toString();
    const isCustomer = customerId === userId;
    const isProvider = providerId === userId;
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isCustomer && !isProvider && !isAdmin) {
      return sendError(res, 'Not authorized to update this booking', [], 403);
    }

    if (!Object.values(BOOKING_STATUS).includes(status)) {
      return sendError(res, 'Invalid booking status', [], 400);
    }

    // Validation of transitions
    if (status === BOOKING_STATUS.ACCEPTED && !isProvider && !isAdmin) {
      return sendError(res, 'Only the service provider can accept booking requests', [], 403);
    }

    if (status === BOOKING_STATUS.CANCELLED) {
      booking.cancellationReason = cancellationReason || note || 'Booking cancelled';
      booking.cancelledBy = req.user.id;
    }

    if (status === BOOKING_STATUS.COMPLETED) {
      if (!isProvider && !isAdmin) {
        return sendError(res, 'Only the provider or admin can mark a job as completed', [], 403);
      }
      booking.paymentStatus = PAYMENT_STATUS.PAID;

      // Update provider profile job counters
      if (booking.bookingType === 'driver') {
        await DriverProfile.findOneAndUpdate(
          { user: booking.provider },
          { $inc: { completedJobs: 1 } }
        );
      } else {
        await ProviderProfile.findOneAndUpdate(
          { user: booking.provider },
          { $inc: { jobsCompleted: 1 } }
        );
      }
    }

    booking.status = status;
    booking.statusTimeline.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated to ${status}`,
      updatedBy: req.user.id
    });

    await booking.save();

    // Send in-app notification to the counterpart
    const notifyTargetId = isCustomer ? booking.provider : booking.customer;
    const notifyType = `booking_${status}`;
    const statusTitles = {
      accepted: 'Booking Accepted',
      rejected: 'Booking Request Declined',
      confirmed: 'Booking Confirmed',
      in_progress: 'Job Started',
      completed: 'Job Completed',
      cancelled: 'Booking Cancelled',
      disputed: 'Dispute Logged'
    };

    await notificationService.createNotification({
      recipient: notifyTargetId,
      sender: req.user.id,
      type: notifyType,
      title: statusTitles[status] || 'Booking Update',
      message: `Booking #${booking._id.toString().slice(-6)} status has been updated to: ${status}.`,
      link: `/bookings/${booking._id}`
    });

    const populated = await Booking.findById(booking._id)
      .populate('customer', 'name phone avatar')
      .populate('provider', 'name phone avatar')
      .populate('service', 'title icon');

    return sendSuccess(res, `Booking status updated to ${status}`, { booking: populated });
  } catch (error) {
    next(error);
  }
};

export const openBookingDispute = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return sendError(res, 'Invalid booking ID format', [], 400);
    }

    const { reason, details } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return sendError(res, 'Booking not found', [], 404);
    }

    const userId = req.user.id.toString();
    const customerId = (booking.customer?._id || booking.customer)?.toString();
    const providerId = (booking.provider?._id || booking.provider)?.toString();
    if (customerId !== userId && providerId !== userId && req.user.role !== ROLES.ADMIN) {
      return sendError(res, 'Not authorized to dispute this booking', [], 403);
    }

    booking.status = BOOKING_STATUS.DISPUTED;
    booking.dispute = {
      reason,
      details,
      status: 'open',
      createdAt: new Date()
    };
    booking.statusTimeline.push({
      status: BOOKING_STATUS.DISPUTED,
      timestamp: new Date(),
      note: `Dispute opened: ${reason}`,
      updatedBy: req.user.id
    });

    await booking.save();

    return sendSuccess(res, 'Dispute filed successfully. WedaMate administration has been alerted.', { booking });
  } catch (error) {
    next(error);
  }
};
