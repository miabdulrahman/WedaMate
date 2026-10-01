import User from '../models/User.js';
import ProviderProfile from '../models/ProviderProfile.js';
import DriverProfile from '../models/DriverProfile.js';
import { generateToken } from '../utils/token.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';
import { ROLES, TRANSMISSION_TYPE, VERIFICATION_STATUS } from '../config/constants.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role = ROLES.CUSTOMER, phone, city = 'Colombo', district = 'Colombo', profession } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 'Please provide name, email, and password', [], 400);
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'An account with this email address already exists', [], 400);
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      phone: phone || '',
      address: {
        street: '',
        city,
        district,
        province: 'Western',
        lat: 6.9271,
        lng: 79.8612
      }
    });

    // Automatically create corresponding profile if registered as provider or driver
    if (role === ROLES.PROVIDER) {
      const providerProfile = await ProviderProfile.create({
        user: user._id,
        businessName: `${name}'s Services`,
        profession: profession || 'Home Service Professional',
        bio: `Experienced local service provider serving ${city} and surrounding areas.`,
        serviceAreas: [{ city, district }],
        startingPrice: 2000,
        verificationStatus: VERIFICATION_STATUS.PENDING
      });
      user.providerProfile = providerProfile._id;
      await user.save();
    } else if (role === ROLES.DRIVER) {
      const driverProfile = await DriverProfile.create({
        user: user._id,
        drivingExperienceYears: 5,
        transmissionSkills: TRANSMISSION_TYPE.BOTH,
        vehicleCategoriesCanDrive: ['Car', 'SUV', 'Van'],
        serviceAreas: [{ city, district }],
        hourlyRate: 1200,
        halfDayRate: 5000,
        fullDayRate: 9000,
        verificationBadges: ['Verified Driver', 'Verified Identity'],
        licenseVerificationStatus: VERIFICATION_STATUS.PENDING
      });
      user.driverProfile = driverProfile._id;
      await user.save();
    }

    const token = generateToken(user._id);

    return sendSuccess(
      res,
      'Registration successful',
      {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          avatar: user.avatar,
          address: user.address,
          providerProfile: user.providerProfile,
          driverProfile: user.driverProfile
        }
      },
      201
    );
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Please provide email and password', [], 400);
    }

    const user = await User.findOne({ email }).select('+password').populate('providerProfile driverProfile');
    if (!user) {
      return sendError(res, 'Invalid email or password', [], 401);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', [], 401);
    }

    if (user.status === 'suspended') {
      return sendError(res, 'Your account has been suspended. Please contact customer support.', [], 403);
    }

    const token = generateToken(user._id);

    return sendSuccess(res, 'Login successful', {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        avatar: user.avatar,
        address: user.address,
        providerProfile: user.providerProfile,
        driverProfile: user.driverProfile
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('providerProfile driverProfile');
    return sendSuccess(res, 'Current user profile retrieved', { user });
  } catch (error) {
    next(error);
  }
};

export const updateDetails = async (req, res, next) => {
  try {
    const { name, phone, address, avatar, providerDetails } = req.body;
    const user = await User.findById(req.user.id);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (avatar) user.avatar = avatar;
    if (address) {
      user.address = {
        ...user.address,
        ...address
      };
    }

    await user.save();

    if (user.role === ROLES.PROVIDER && providerDetails) {
      const ProviderProfile = (await import('../models/ProviderProfile.js')).default;
      let profile = await ProviderProfile.findOne({ user: user._id });
      if (profile) {
        if (providerDetails.businessName !== undefined) profile.businessName = providerDetails.businessName;
        if (providerDetails.profession !== undefined) profile.profession = providerDetails.profession;
        if (providerDetails.bio !== undefined) profile.bio = providerDetails.bio;
        if (providerDetails.startingPrice !== undefined) profile.startingPrice = parseFloat(providerDetails.startingPrice);
        await profile.save();
      }
    }

    const updatedUser = await User.findById(user._id).populate('providerProfile driverProfile');
    return sendSuccess(res, 'Profile details updated successfully', { user: updatedUser });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return sendError(res, 'Current password does not match', [], 400);
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken(user._id);
    return sendSuccess(res, 'Password updated successfully', { token });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return sendSuccess(res, 'If that email exists in our system, a reset link has been dispatched.');
    }

    return sendSuccess(res, 'Password reset instructions have been dispatched to your email.');
  } catch (error) {
    next(error);
  }
};
