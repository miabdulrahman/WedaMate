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
    const { bookingType, serviceId, driverId, rateType = 'hourly', durationHours = 2 } = req.body;

    let baseAmount = 0;

    if (bookingType === 'driver') {
      const driver = await DriverProfile.findOne({
        $or: [{ _id: driverId }, { user: driverId }]
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
      const service = await Service.findById(serviceId);
      if (!service) {
        return sendError(res, 'Service not found', [], 404);
      }
      baseAmount = service.basePrice || 2500;
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

    const dateObj = new Date(scheduledDate);
    dateObj.setHours(0, 0, 0, 0);

    // Double-booking check: verify provider doesn't already have an active booking at the same date & time slot
    const existingConflict = await Booking.findOne({
      provider: providerId,
      scheduledDate: {
        $gte: new Date(dateObj),
        $lt: new Date(dateObj.getTime() + 24 * 60 * 60 * 1000)
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

    if (bookingType === 'driver') {
      const driver = await DriverProfile.findOne({
        $or: [{ _id: providerId }, { user: providerId }]
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
    } else {
      const service = await Service.findById(serviceId).populate('category', 'name');
      if (!service) {
        return sendError(res, 'Selected service not found', [], 404);
      }
      price = service.basePrice;
      serviceSnapshot = {
        title: service.title,
        categoryName: service.category?.name || 'Local Service',
        pricingType: service.pricingType,
        unitPrice: service.basePrice
      };
    }

    const fees = await paymentService.calculateFees(price);

    const booking = await Booking.create({
      customer: customerId,
      provider: providerId,
      bookingType,
      service: serviceId || null,
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
      recipient: providerId,
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
    const isAuthorized =
      booking.customer._id.toString() === userId ||
      booking.provider._id.toString() === userId ||
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
    const { status, note, cancellationReason } = req.body;
    const userId = req.user.id.toString();
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return sendError(res, 'Booking not found', [], 404);
    }

    const isCustomer = booking.customer.toString() === userId;
    const isProvider = booking.provider.toString() === userId;
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
    const { reason, details } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return sendError(res, 'Booking not found', [], 404);
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
