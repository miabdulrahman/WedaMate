import Task from '../models/Task.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import paymentService from '../services/paymentService.js';
import notificationService from '../services/notificationService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { BOOKING_STATUS, PAYMENT_STATUS, ROLES } from '../config/constants.js';

export const createTask = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const { title, category, description, location, budget, preferredDate, images } = req.body;

    if (!title || !description || !location || !location.city || !budget) {
      return sendError(res, 'Please provide title, description, location, and budget', [], 400);
    }

    const task = await Task.create({
      customer: customerId,
      title,
      category: category || null,
      description,
      location,
      budget: parseFloat(budget),
      preferredDate: preferredDate ? new Date(preferredDate) : null,
      images: images || [],
      status: 'open'
    });

    return sendSuccess(res, 'Task posted successfully', { task }, 201);
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (req, res, next) => {
  try {
    const { category, city, status = 'open', myTasks } = req.query;
    const filter = {};

    if (myTasks === 'true') {
      filter.customer = req.user.id;
    } else {
      if (status) filter.status = status;
    }

    if (category) filter.category = category;
    if (city) filter['location.city'] = { $regex: new RegExp(city, 'i') };

    const tasks = await Task.find(filter)
      .populate('customer', 'name avatar address')
      .populate('category', 'name slug icon')
      .populate('bids.provider', 'name avatar role')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Tasks retrieved successfully', { tasks });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('customer', 'name avatar phone email address')
      .populate('category', 'name slug icon')
      .populate('bids.provider', 'name avatar phone email role');

    if (!task) {
      return sendError(res, 'Task not found', [], 404);
    }

    return sendSuccess(res, 'Task retrieved successfully', { task });
  } catch (error) {
    next(error);
  }
};

export const submitBid = async (req, res, next) => {
  try {
    const providerId = req.user.id;
    const { amount, message, estimatedDays } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return sendError(res, 'Task not found', [], 404);
    }

    if (task.status !== 'open') {
      return sendError(res, 'This task is no longer open for bids', [], 400);
    }

    if (task.customer.toString() === providerId.toString()) {
      return sendError(res, 'You cannot bid on your own task', [], 400);
    }

    // Check if provider already bid
    const existingBid = task.bids.find(b => b.provider.toString() === providerId.toString());
    if (existingBid) {
      existingBid.amount = parseFloat(amount);
      existingBid.message = message;
      existingBid.estimatedDays = estimatedDays;
    } else {
      task.bids.push({
        provider: providerId,
        amount: parseFloat(amount),
        message,
        estimatedDays
      });
    }

    await task.save();

    await notificationService.createNotification({
      recipient: task.customer,
      sender: providerId,
      type: 'quote_received',
      title: 'New Offer on Your Task',
      message: `A provider submitted an offer of LKR ${amount} for your task: "${task.title}".`,
      link: `/dashboard`
    });

    return sendSuccess(res, 'Offer submitted successfully', { task });
  } catch (error) {
    next(error);
  }
};

export const acceptBid = async (req, res, next) => {
  try {
    const { bidId } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return sendError(res, 'Task not found', [], 404);
    }

    if (task.customer.toString() !== req.user.id.toString()) {
      return sendError(res, 'Only the task poster can accept bids', [], 403);
    }

    const bid = task.bids.id(bidId);
    if (!bid) {
      return sendError(res, 'Bid not found', [], 404);
    }

    bid.status = 'accepted';
    task.status = 'assigned';
    task.assignedProvider = bid.provider;

    const fees = await paymentService.calculateFees(bid.amount);

    const booking = await Booking.create({
      customer: task.customer,
      provider: bid.provider,
      bookingType: 'service',
      serviceSnapshot: {
        title: task.title,
        categoryName: 'Custom Marketplace Task',
        pricingType: 'quote_based',
        unitPrice: bid.amount
      },
      location: {
        address: task.location.address || `${task.location.city}, ${task.location.district}`,
        city: task.location.city,
        district: task.location.district
      },
      scheduledDate: task.preferredDate || new Date(Date.now() + 24 * 60 * 60 * 1000),
      startTime: '09:00',
      durationHours: (bid.estimatedDays || 1) * 4,
      price: bid.amount,
      platformFee: fees.platformFee,
      totalAmount: fees.customerTotal,
      providerEarnings: fees.providerEarnings,
      paymentStatus: PAYMENT_STATUS.PENDING,
      status: BOOKING_STATUS.CONFIRMED,
      notes: `Generated from Task "${task.title}". Offer message: ${bid.message || 'None'}`
    });

    task.booking = booking._id;
    await task.save();

    await notificationService.createNotification({
      recipient: bid.provider,
      sender: req.user.id,
      type: 'quote_accepted',
      title: 'Your Offer Was Accepted!',
      message: `Your offer for task "${task.title}" was accepted! Booking #${booking._id.toString().slice(-6)} confirmed.`,
      link: '/provider/bookings'
    });

    return sendSuccess(res, 'Offer accepted and confirmed booking created', { task, booking });
  } catch (error) {
    next(error);
  }
};
