import Vehicle from '../models/Vehicle.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getMyVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find({ user: req.user.id }).sort({ createdAt: -1 });
    return sendSuccess(res, 'Vehicles retrieved successfully', { vehicles });
  } catch (error) {
    next(error);
  }
};

export const addVehicle = async (req, res, next) => {
  try {
    const { nickname, vehicleType, brand, model, year, transmission, registrationNumber, isDefault } = req.body;

    if (!nickname || !brand || !model || !transmission) {
      return sendError(res, 'Please provide vehicle nickname, brand, model, and transmission type', [], 400);
    }

    if (isDefault) {
      await Vehicle.updateMany({ user: req.user.id }, { isDefault: false });
    }

    const vehicle = await Vehicle.create({
      user: req.user.id,
      nickname,
      vehicleType,
      brand,
      model,
      year: parseInt(year) || 2018,
      transmission,
      registrationNumber: registrationNumber || '',
      isDefault: Boolean(isDefault)
    });

    return sendSuccess(res, 'Vehicle registered successfully', { vehicle }, 201);
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOne({ _id: req.params.id, user: req.user.id });
    if (!vehicle) {
      return sendError(res, 'Vehicle not found', [], 404);
    }

    if (req.body.isDefault) {
      await Vehicle.updateMany({ user: req.user.id }, { isDefault: false });
    }

    Object.assign(vehicle, req.body);
    await vehicle.save();

    return sendSuccess(res, 'Vehicle updated successfully', { vehicle });
  } catch (error) {
    next(error);
  }
};

export const deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!vehicle) {
      return sendError(res, 'Vehicle not found', [], 404);
    }

    return sendSuccess(res, 'Vehicle removed successfully');
  } catch (error) {
    next(error);
  }
};
