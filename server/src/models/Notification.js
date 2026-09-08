import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      required: true,
      enum: [
        'booking_request',
        'booking_accepted',
        'booking_rejected',
        'booking_started',
        'booking_completed',
        'booking_cancelled',
        'quote_received',
        'quote_accepted',
        'quote_rejected',
        'new_message',
        'review_received',
        'verification_approved',
        'verification_rejected',
        'dispute_opened',
        'system'
      ]
    },
    title: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    link: {
      type: String,
      default: '/dashboard'
    },
    read: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 });

export default mongoose.model('Notification', notificationSchema);
