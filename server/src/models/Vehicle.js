import mongoose from 'mongoose';
import { TRANSMISSION_TYPE, VEHICLE_TYPE } from '../config/constants.js';

const vehicleSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    nickname: {
      type: String,
      required: [true, 'Please provide a nickname for your vehicle (e.g. My Prius, Family Van)'],
      trim: true
    },
    vehicleType: {
      type: String,
      enum: Object.values(VEHICLE_TYPE),
      default: VEHICLE_TYPE.CAR
    },
    brand: {
      type: String,
      required: [true, 'Please enter vehicle make/brand (e.g. Toyota, Honda)'],
      trim: true
    },
    model: {
      type: String,
      required: [true, 'Please enter vehicle model (e.g. Axio, Grace, Vezel)'],
      trim: true
    },
    year: {
      type: Number,
      min: 1980,
      max: 2030,
      default: 2018
    },
    transmission: {
      type: String,
      enum: [TRANSMISSION_TYPE.MANUAL, TRANSMISSION_TYPE.AUTOMATIC],
      required: true,
      default: TRANSMISSION_TYPE.AUTOMATIC
    },
    registrationNumber: {
      type: String,
      trim: true,
      default: '' // e.g. "WP CAQ-1234"
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

vehicleSchema.index({ user: 1 });

export default mongoose.model('Vehicle', vehicleSchema);
