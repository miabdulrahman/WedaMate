import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reportedUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    reason: {
      type: String,
      enum: ['no_show', 'poor_service', 'incorrect_price', 'safety_issue', 'miscommunication', 'other'],
      required: true
    },
    description: {
      type: String,
      required: [true, 'Please provide report details'],
      trim: true
    },
    status: {
      type: String,
      enum: ['open', 'investigating', 'resolved', 'rejected'],
      default: 'open'
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolutionNotes: String,
    resolvedAt: Date
  },
  {
    timestamps: true
  }
);

reportSchema.index({ status: 1 });
reportSchema.index({ booking: 1 });

export default mongoose.model('Report', reportSchema);
