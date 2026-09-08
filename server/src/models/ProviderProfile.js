import mongoose from 'mongoose';
import { VERIFICATION_STATUS } from '../config/constants.js';

const providerProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    businessName: {
      type: String,
      trim: true,
      default: ''
    },
    profession: {
      type: String,
      required: [true, 'Please provide profession or primary service'],
      trim: true
    },
    bio: {
      type: String,
      default: ''
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
      }
    ],
    subcategories: [
      {
        type: String,
        trim: true
      }
    ],
    serviceAreas: [
      {
        city: { type: String, required: true },
        district: { type: String, required: true }
      }
    ],
    startingPrice: {
      type: Number,
      default: 2000 // In LKR
    },
    pricingType: {
      type: String,
      enum: ['fixed', 'hourly', 'quote_based'],
      default: 'quote_based'
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0
    },
    jobsCompleted: {
      type: Number,
      default: 0
    },
    completionRate: {
      type: Number,
      default: 98
    },
    responseTimeMinutes: {
      type: Number,
      default: 15
    },
    cancellationRate: {
      type: Number,
      default: 2
    },
    languages: {
      type: [String],
      default: ['Sinhala', 'English']
    },
    verificationStatus: {
      type: String,
      enum: Object.values(VERIFICATION_STATUS),
      default: VERIFICATION_STATUS.PENDING
    },
    badges: {
      type: [String],
      default: ['Verified Professional']
    },
    portfolio: [
      {
        title: String,
        imageUrl: String,
        description: String
      }
    ],
    availability: {
      daysOfWeek: {
        type: [Number],
        default: [1, 2, 3, 4, 5, 6] // Mon-Sat
      },
      startTime: {
        type: String,
        default: '08:00'
      },
      endTime: {
        type: String,
        default: '18:00'
      },
      isAvailableToday: {
        type: Boolean,
        default: true
      }
    },
    featured: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

providerProfileSchema.index({ profession: 'text', bio: 'text', businessName: 'text' });
providerProfileSchema.index({ rating: -1, jobsCompleted: -1 });
providerProfileSchema.index({ 'serviceAreas.city': 1 });
providerProfileSchema.index({ verificationStatus: 1 });

export default mongoose.model('ProviderProfile', providerProfileSchema);
