import mongoose from 'mongoose';
import { VERIFICATION_STATUS } from '../config/constants.js';

const verificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    profileType: {
      type: String,
      enum: ['provider', 'driver'],
      required: true
    },
    nationalIdNumber: {
      type: String,
      required: true,
      trim: true
    },
    drivingLicenseNumber: {
      type: String,
      trim: true
    },
    drivingExperienceYears: Number,
    documents: [
      {
        docType: {
          type: String,
          enum: ['national_id', 'driving_license', 'police_clearance', 'vocational_certificate', 'other']
        },
        docUrl: String,
        title: String,
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    status: {
      type: String,
      enum: Object.values(VERIFICATION_STATUS),
      default: VERIFICATION_STATUS.PENDING
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewNotes: String,
    reviewedAt: Date
  },
  {
    timestamps: true
  }
);

verificationSchema.index({ status: 1 });
verificationSchema.index({ profileType: 1 });

export default mongoose.model('Verification', verificationSchema);
