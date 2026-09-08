import mongoose from 'mongoose';
import { PAYMENT_STATUS } from '../config/constants.js';

const paymentSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true
    },
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
    amount: {
      type: Number,
      required: true
    },
    platformCommission: {
      type: Number,
      required: true
    },
    providerEarnings: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'LKR'
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PAID
    },
    paymentMethod: {
      type: String,
      default: 'Direct Pay (Mock / PayHere Gateway)'
    },
    gatewayResponse: {
      type: Object,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

paymentSchema.index({ customer: 1 });
paymentSchema.index({ provider: 1 });
paymentSchema.index({ booking: 1 });
paymentSchema.index({ status: 1 });

export default mongoose.model('Payment', paymentSchema);
