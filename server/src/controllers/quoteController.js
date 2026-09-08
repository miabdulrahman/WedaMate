import Quote from '../models/Quote.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Service from '../models/Service.js';
import paymentService from '../services/paymentService.js';
import notificationService from '../services/notificationService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { BOOKING_STATUS, PAYMENT_STATUS, QUOTE_STATUS } from '../config/constants.js';

export const requestQuote = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { providerId, serviceId, taskDescription, location, preferredDate } = req.body;

    if (!providerId || !taskDescription || !location || !location.city) {
      return sendError(res, 'Please provide provider, task description, and location', [], 400);
    }

    const quote = await Quote.create({
      customer: customerId,
      provider: providerId,
      service: serviceId || null,
      taskDescription,
      location,
      preferredDate: preferredDate ? new Date(preferredDate) : null,
      status: QUOTE_STATUS.PENDING
    });

    const customer = await User.findById(customerId);
    await notificationService.createNotification({
      recipient: providerId,
      sender: customerId,
      type: 'quote_received',
      title: 'New Quote Request',
      message: `${customer?.name || 'A customer'} requested a custom quote for: "${taskDescription.slice(0, 40)}..."`,
      link: '/provider/quotes'
    });

    return sendSuccess(res, 'Quote requested successfully', { quote }, 201);
  } catch (error) {
    next(error);
  }
};

export const getQuotes = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status } = req.query;
    const filter = {
      $or: [{ customer: userId }, { provider: userId }]
    };

    if (status) {
      filter.status = status;
    }

    const quotes = await Quote.find(filter)
      .populate('customer', 'name avatar phone email')
      .populate('provider', 'name avatar phone email')
      .populate('service', 'title icon')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Quotes retrieved successfully', { quotes });
  } catch (error) {
    next(error);
  }
};

export const respondQuote = async (req, res, next) => {
  try {
    const { proposedPrice, estimatedDurationHours, materialsIncluded, materialsDetails, notes, validUntilDays = 7 } = req.body;
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return sendError(res, 'Quote not found', [], 404);
    }

    if (quote.provider.toString() !== req.user.id.toString()) {
      return sendError(res, 'Only the designated provider can submit an offer for this quote', [], 403);
    }

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + parseInt(validUntilDays));

    quote.offer = {
      proposedPrice: parseFloat(proposedPrice),
      estimatedDurationHours: parseInt(estimatedDurationHours) || 2,
      materialsIncluded: Boolean(materialsIncluded),
      materialsDetails: materialsDetails || '',
      notes: notes || '',
      validUntil,
      submittedAt: new Date()
    };

    await quote.save();

    const provider = await User.findById(req.user.id);
    await notificationService.createNotification({
      recipient: quote.customer,
      sender: req.user.id,
      type: 'quote_received',
      title: 'Quote Offer Received',
      message: `${provider?.name || 'Provider'} sent an offer of LKR ${proposedPrice} for your quote request.`,
      link: '/bookings'
    });

    return sendSuccess(res, 'Quote response submitted successfully', { quote });
  } catch (error) {
    next(error);
  }
};

export const acceptQuote = async (req, res, next) => {
  try {
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return sendError(res, 'Quote not found', [], 404);
    }

    if (quote.customer.toString() !== req.user.id.toString()) {
      return sendError(res, 'Only the requesting customer can accept this quote', [], 403);
    }

    if (!quote.offer || !quote.offer.proposedPrice) {
      return sendError(res, 'No price offer has been submitted for this quote yet', [], 400);
    }

    quote.status = QUOTE_STATUS.ACCEPTED;

    // Convert into a real Booking
    const fees = await paymentService.calculateFees(quote.offer.proposedPrice);
    const scheduledDate = quote.preferredDate || new Date(Date.now() + 24 * 60 * 60 * 1000);

    const booking = await Booking.create({
      customer: quote.customer,
      provider: quote.provider,
      bookingType: 'service',
      service: quote.service || null,
      serviceSnapshot: {
        title: 'Custom Quote Job',
        categoryName: 'Custom Request',
        pricingType: 'quote_based',
        unitPrice: quote.offer.proposedPrice
      },
      location: {
        address: quote.location.address || `${quote.location.city}, ${quote.location.district}`,
        city: quote.location.city,
        district: quote.location.district
      },
      scheduledDate,
      startTime: '09:00',
      durationHours: quote.offer.estimatedDurationHours || 2,
      price: quote.offer.proposedPrice,
      platformFee: fees.platformFee,
      totalAmount: fees.customerTotal,
      providerEarnings: fees.providerEarnings,
      paymentStatus: PAYMENT_STATUS.PENDING,
      status: BOOKING_STATUS.CONFIRMED,
      notes: `Generated from accepted quote #${quote._id.toString().slice(-6)}. Notes: ${quote.offer.notes || 'None'}`,
      statusTimeline: [
        {
          status: BOOKING_STATUS.CONFIRMED,
          timestamp: new Date(),
          note: `Quote accepted with agreed price LKR ${quote.offer.proposedPrice}`,
          updatedBy: req.user.id
        }
      ]
    });

    quote.booking = booking._id;
    await quote.save();

    await notificationService.createNotification({
      recipient: quote.provider,
      sender: req.user.id,
      type: 'quote_accepted',
      title: 'Quote Accepted!',
      message: `Your quote offer for LKR ${quote.offer.proposedPrice} was accepted! A confirmed booking #${booking._id.toString().slice(-6)} has been created.`,
      link: `/provider/bookings`
    });

    return sendSuccess(res, 'Quote accepted and confirmed booking created', { quote, booking });
  } catch (error) {
    next(error);
  }
};

export const rejectQuote = async (req, res, next) => {
  try {
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return sendError(res, 'Quote not found', [], 404);
    }

    quote.status = QUOTE_STATUS.REJECTED;
    await quote.save();

    return sendSuccess(res, 'Quote rejected', { quote });
  } catch (error) {
    next(error);
  }
};
