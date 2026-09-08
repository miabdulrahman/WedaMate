import mongoose from 'mongoose';

const platformSettingsSchema = new mongoose.Schema(
  {
    commissionPercentage: {
      type: Number,
      default: 10,
      min: 0,
      max: 50
    },
    baseServiceFee: {
      type: Number,
      default: 250 // Fixed LKR booking fee
    },
    driverHourlyMinRate: {
      type: Number,
      default: 800 // Min LKR/hr
    },
    driverHalfDayMinRate: {
      type: Number,
      default: 3500
    },
    driverFullDayMinRate: {
      type: Number,
      default: 7000
    },
    autoApproveReviews: {
      type: Boolean,
      default: true
    },
    emergencySurchargePercentage: {
      type: Number,
      default: 15
    },
    supportContact: {
      phone: { type: String, default: '+94 11 234 5678' },
      email: { type: String, default: 'support@wedamate.lk' },
      whatsapp: { type: String, default: '+94 77 123 4567' }
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model('PlatformSettings', platformSettingsSchema);
