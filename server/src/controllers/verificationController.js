import Verification from '../models/Verification.js';
import User from '../models/User.js';
import ProviderProfile from '../models/ProviderProfile.js';
import DriverProfile from '../models/DriverProfile.js';
import notificationService from '../services/notificationService.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { ROLES, VERIFICATION_STATUS } from '../config/constants.js';

export const submitVerification = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { profileType, nationalIdNumber, drivingLicenseNumber, drivingExperienceYears, documents } = req.body;

    if (!nationalIdNumber) {
      return sendError(res, 'Please provide your National Identity Card (NIC) or Passport number', [], 400);
    }

    let verification = await Verification.findOne({ user: userId });
    if (!verification) {
      verification = await Verification.create({
        user: userId,
        profileType: profileType || (req.user.role === ROLES.DRIVER ? 'driver' : 'provider'),
        nationalIdNumber,
        drivingLicenseNumber,
        drivingExperienceYears: parseInt(drivingExperienceYears) || 3,
        documents: documents || [],
        status: VERIFICATION_STATUS.PENDING
      });
    } else {
      verification.nationalIdNumber = nationalIdNumber;
      if (drivingLicenseNumber) verification.drivingLicenseNumber = drivingLicenseNumber;
      if (drivingExperienceYears) verification.drivingExperienceYears = parseInt(drivingExperienceYears);
      if (documents && documents.length > 0) verification.documents = documents;
      verification.status = VERIFICATION_STATUS.PENDING;
      verification.reviewNotes = '';
      await verification.save();
    }

    // Update profile status to pending
    if (req.user.role === ROLES.DRIVER) {
      await DriverProfile.findOneAndUpdate(
        { user: userId },
        { licenseVerificationStatus: VERIFICATION_STATUS.PENDING }
      );
    } else if (req.user.role === ROLES.PROVIDER) {
      await ProviderProfile.findOneAndUpdate(
        { user: userId },
        { verificationStatus: VERIFICATION_STATUS.PENDING }
      );
    }

    return sendSuccess(res, 'Verification documents submitted for administrative review', { verification }, 201);
  } catch (error) {
    next(error);
  }
};

export const getMyVerificationStatus = async (req, res, next) => {
  try {
    const verification = await Verification.findOne({ user: req.user.id });
    return sendSuccess(res, 'Verification status retrieved', {
      verification: verification || { status: VERIFICATION_STATUS.UNVERIFIED }
    });
  } catch (error) {
    next(error);
  }
};

export const adminGetVerifications = async (req, res, next) => {
  try {
    const { status, profileType } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (profileType) filter.profileType = profileType;

    const verifications = await Verification.find(filter)
      .populate('user', 'name email phone avatar role address')
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 'Verifications list retrieved', { verifications });
  } catch (error) {
    next(error);
  }
};

export const adminReviewVerification = async (req, res, next) => {
  try {
    const { status, reviewNotes, badges = [] } = req.body;
    const verification = await Verification.findById(req.params.id).populate('user');

    if (!verification) {
      return sendError(res, 'Verification record not found', [], 404);
    }

    if (!Object.values(VERIFICATION_STATUS).includes(status)) {
      return sendError(res, 'Invalid verification status', [], 400);
    }

    verification.status = status;
    verification.reviewNotes = reviewNotes || '';
    verification.reviewedBy = req.user.id;
    verification.reviewedAt = new Date();
    await verification.save();

    // Propagate verification status to Provider/Driver profiles and apply badges
    const targetUserId = verification.user._id;

    if (verification.profileType === 'driver' || verification.user.role === ROLES.DRIVER) {
      const defaultDriverBadges = status === VERIFICATION_STATUS.VERIFIED
        ? ['Verified Driver', 'Verified Identity', ...badges]
        : [];

      await DriverProfile.findOneAndUpdate(
        { user: targetUserId },
        {
          licenseVerificationStatus: status,
          verificationBadges: defaultDriverBadges
        }
      );
    } else {
      const defaultProviderBadges = status === VERIFICATION_STATUS.VERIFIED
        ? ['Verified Professional', 'Verified Identity', ...badges]
        : [];

      await ProviderProfile.findOneAndUpdate(
        { user: targetUserId },
        {
          verificationStatus: status,
          badges: defaultProviderBadges
        }
      );
    }

    const isApproved = status === VERIFICATION_STATUS.VERIFIED;
    await notificationService.createNotification({
      recipient: targetUserId,
      sender: req.user.id,
      type: isApproved ? 'verification_approved' : 'verification_rejected',
      title: isApproved ? 'Verification Approved!' : 'Verification Update Required',
      message: isApproved
        ? 'Congratulations! Your verification documents have been verified by WedaMate administration.'
        : `Your verification submission was not approved: ${reviewNotes || 'Please contact support for more details.'}`,
      link: '/profile'
    });

    return sendSuccess(res, `Verification status updated to ${status}`, { verification });
  } catch (error) {
    next(error);
  }
};
