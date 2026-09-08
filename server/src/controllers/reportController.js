import Report from '../models/Report.js';
import Booking from '../models/Booking.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { ROLES, BOOKING_STATUS } from '../config/constants.js';

export const createReport = async (req, res, next) => {
  try {
    const { bookingId, reportedUserId, reason, description } = req.body;

    if (!reason || !description) {
      return sendError(res, 'Please provide reason and details of the report', [], 400);
    }

    const report = await Report.create({
      reporter: req.user.id,
      reportedUser: reportedUserId || null,
      booking: bookingId || null,
      reason,
      description,
      status: 'open'
    });

    if (bookingId) {
      await Booking.findByIdAndUpdate(bookingId, {
        status: BOOKING_STATUS.DISPUTED,
        dispute: {
          reason,
          details: description,
          status: 'open',
          createdAt: new Date()
        }
      });
    }

    return sendSuccess(res, 'Report submitted successfully. Our team will review it shortly.', { report }, 201);
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const reports = await Report.find(filter)
      .populate('reporter', 'name email phone avatar')
      .populate('reportedUser', 'name email phone avatar')
      .populate('booking', 'bookingType serviceSnapshot status scheduledDate')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Reports retrieved', { reports });
  } catch (error) {
    next(error);
  }
};

export const resolveReport = async (req, res, next) => {
  try {
    const { status, resolutionNotes } = req.body;
    const report = await Report.findById(req.params.id);

    if (!report) {
      return sendError(res, 'Report not found', [], 404);
    }

    report.status = status || 'resolved';
    report.resolutionNotes = resolutionNotes || '';
    report.resolvedBy = req.user.id;
    report.resolvedAt = new Date();
    await report.save();

    if (report.booking) {
      await Booking.findByIdAndUpdate(report.booking, {
        'dispute.status': status || 'resolved',
        'dispute.resolvedAt': new Date(),
        'dispute.resolutionNotes': resolutionNotes || ''
      });
    }

    return sendSuccess(res, `Report marked as ${report.status}`, { report });
  } catch (error) {
    next(error);
  }
};
