import mongoose from 'mongoose';
import { TRANSMISSION_TYPE, VERIFICATION_STATUS } from '../config/constants.js';

const driverProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    drivingExperienceYears: {
      type: Number,
      required: [true, 'Please specify driving experience in years'],
      min: 1,
      default: 5
    },
    transmissionSkills: {
      type: String,
      enum: Object.values(TRANSMISSION_TYPE),
      default: TRANSMISSION_TYPE.BOTH
    },
    vehicleCategoriesCanDrive: {
      type: [String],
      default: ['Car', 'SUV', 'Van']
    },
    serviceAreas: [
      {
        city: { type: String, required: true },
        district: { type: String, required: true }
      }
    ],
    // Differentiated rate structure in LKR
    hourlyRate: {
      type: Number,
      required: true,
      default: 1200 // LKR per hour
    },
    halfDayRate: {
      type: Number,
      default: 5000 // LKR for up to 5 hours
    },
    fullDayRate: {
      type: Number,
      default: 9000 // LKR for up to 10 hours
    },
    recurringAgreementsOffered: {
      type: Boolean,
      default: true
    },
    specialties: {
      type: [String],
      default: [
        'Night Driving',
        'Highway Driving',
        'Long-distance Journeys',
        'Airport Pickups',
        'Elderly Passenger Care'
      ]
    },
    licenseNumber: {
      type: String,
      default: '' // Masked or private, never exposed to public
    },
    licenseVerificationStatus: {
      type: String,
      enum: Object.values(VERIFICATION_STATUS),
      default: VERIFICATION_STATUS.PENDING
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5
    },
    drivingSkillScore: {
      type: Number,
      default: 4.9
    },
    punctualityScore: {
      type: Number,
      default: 5.0
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    completedJobs: {
      type: Number,
      default: 0
    },
    cancellationRate: {
      type: Number,
      default: 1
    },
    responseTimeMinutes: {
      type: Number,
      default: 8
    },
    languages: {
      type: [String],
      default: ['Sinhala', 'English']
    },
    verificationBadges: {
      type: [String],
      default: ['Verified Driver', 'Verified Identity']
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    schedule: {
      daysOfWeek: {
        type: [Number],
        default: [0, 1, 2, 3, 4, 5, 6] // Available all days
      },
      startTime: {
        type: String,
        default: '06:00'
      },
      endTime: {
        type: String,
        default: '23:00'
      }
    },
    bio: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

driverProfileSchema.index({ transmissionSkills: 1 });
driverProfileSchema.index({ 'serviceAreas.city': 1 });
driverProfileSchema.index({ isAvailable: 1 });
driverProfileSchema.index({ rating: -1, completedJobs: -1 });

export default mongoose.model('DriverProfile', driverProfileSchema);
