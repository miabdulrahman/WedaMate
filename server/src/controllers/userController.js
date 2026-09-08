import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const toggleSaveProvider = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const { providerId } = req.params;

    const index = user.savedProviders.indexOf(providerId);
    let isSaved = false;

    if (index > -1) {
      user.savedProviders.splice(index, 1);
      isSaved = false;
    } else {
      user.savedProviders.push(providerId);
      isSaved = true;
    }

    await user.save();
    return sendSuccess(res, isSaved ? 'Provider saved to favorites' : 'Provider removed from favorites', {
      isSaved,
      savedProviders: user.savedProviders
    });
  } catch (error) {
    next(error);
  }
};

export const getSavedProviders = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedProviders',
      select: 'name avatar phone address providerProfile driverProfile',
      populate: [
        { path: 'providerProfile' },
        { path: 'driverProfile' }
      ]
    });

    return sendSuccess(res, 'Saved providers retrieved', {
      savedProviders: user.savedProviders || []
    });
  } catch (error) {
    next(error);
  }
};

export const addAddress = async (req, res, next) => {
  try {
    const { label, street, city, district, isDefault } = req.body;
    const user = await User.findById(req.user.id);

    if (isDefault) {
      user.savedAddresses.forEach(a => a.isDefault = false);
    }

    user.savedAddresses.push({
      label: label || 'Home',
      street: street || '',
      city: city || 'Colombo',
      district: district || 'Colombo',
      isDefault: Boolean(isDefault)
    });

    await user.save();
    return sendSuccess(res, 'Address added successfully', { addresses: user.savedAddresses });
  } catch (error) {
    next(error);
  }
};

export const removeAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.savedAddresses = user.savedAddresses.filter(a => a._id.toString() !== req.params.id);
    await user.save();
    return sendSuccess(res, 'Address removed successfully', { addresses: user.savedAddresses });
  } catch (error) {
    next(error);
  }
};
