import mongoose from 'mongoose';
import { BOOKING_STATUS, PAYMENT_STATUS, TRANSMISSION_TYPE, VEHICLE_TYPE } from '../config/constants.js';

const bookingSchema = new mongoose.Schema(
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
    bookingType: {
      type: String,
      enum: ['service', 'driver'],
      default: 'service'
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service'
    },
    // Historical snapshot of the service at time of booking
    serviceSnapshot: {
      title: String,
      categoryName: String,
      pricingType: String,
      unitPrice: Number
    },
    // Dedicated fields for Drive My Vehicle differentiator
    driverDetails: {
      vehicleType: {
        type: String,
        enum: [...Object.values(VEHICLE_TYPE), '']
      },
      transmission: {
        type: String,
        enum: [TRANSMISSION_TYPE.MANUAL, TRANSMISSION_TYPE.AUTOMATIC, '']
      },
      vehicleRegistration: String,
      vehicleNickname: String,
      driverRequirements: [String],
      additionalStops: [String],
      pickupLocation: {
        address: String,
        city: String,
        district: String
      },
      destinationLocation: {
        address: String,
        city: String,
        district: String
      },
      recurringAgreement: {
        type: Boolean,
        default: false
      },
      rateType: {
        type: String,
        enum: ['hourly', 'half_day', 'full_day', 'custom'],
        default: 'hourly'
      }
    },
    location: {
      address: { type: String, required: true },
      city: { type: String, required: true, default: 'Colombo' },
      district: { type: String, required: true, default: 'Colombo' },
      lat: Number,
      lng: Number
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Please provide scheduled date']
    },
    startTime: {
      type: String,
      required: [true, 'Please provide start time (e.g. 09:00)']
    },
    endTime: {
      type: String,
      default: ''
    },
    durationHours: {
      type: Number,
      default: 2,
      min: 1
    },
    // Financials in Sri Lankan Rupee (LKR)
    price: {
      type: Number,
      required: true,
      min: 0
    },
    additionalFees: {
      type: Number,
      default: 0
    },
    platformFee: {
      type: Number,
      required: true,
      default: 0
    },
    totalAmount: {
      type: Number,
      required: true
    },
    providerEarnings: {
      type: Number,
      required: true
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING
    },
    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.PENDING
    },
    notes: {
      type: String,
      default: ''
    },
    cancellationReason: {
      type: String,
      default: ''
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    statusTimeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      }
    ],
    hasReview: {
      type: Boolean,
      default: false
    },
    dispute: {
      reason: String,
      details: String,
      status: {
        type: String,
        enum: ['open', 'investigating', 'resolved', 'rejected']
      },
      createdAt: Date,
      resolvedAt: Date,
      resolutionNotes: String
    }
  },
  {
    timestamps: true
  }
);

bookingSchema.index({ customer: 1 });
bookingSchema.index({ provider: 1, scheduledDate: 1, startTime: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingType: 1 });
bookingSchema.index({ scheduledDate: -1 });

export default mongoose.model('Booking', bookingSchema);
