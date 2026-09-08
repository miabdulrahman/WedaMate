import mongoose from 'mongoose';
import { QUOTE_STATUS } from '../config/constants.js';

const quoteSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service'
    },
    taskDescription: {
      type: String,
      required: [true, 'Please describe what you need quoted'],
      trim: true
    },
    location: {
      city: { type: String, required: true },
      district: { type: String, required: true },
      address: String
    },
    preferredDate: Date,
    status: {
      type: String,
      enum: Object.values(QUOTE_STATUS),
      default: QUOTE_STATUS.PENDING
    },
    // Provider's response quote
    offer: {
      proposedPrice: Number,
      estimatedDurationHours: Number,
      materialsIncluded: { type: Boolean, default: false },
      materialsDetails: String,
      notes: String,
      validUntil: Date,
      submittedAt: Date
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    }
  },
  {
    timestamps: true
  }
);

quoteSchema.index({ customer: 1 });
quoteSchema.index({ provider: 1 });
quoteSchema.index({ status: 1 });

export default mongoose.model('Quote', quoteSchema);
