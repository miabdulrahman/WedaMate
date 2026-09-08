import crypto from 'crypto';
import Payment from '../models/Payment.js';
import PlatformSettings from '../models/PlatformSettings.js';
import { PAYMENT_STATUS } from '../config/constants.js';

export class PaymentService {
  constructor() {
    this.provider = process.env.PAYMENT_PROVIDER || 'mock';
    this.secret = process.env.PAYMENT_SECRET || 'wedamate_dev_payment_secret';
  }

  // Calculate platform fee and provider earnings from base amount
  async calculateFees(amount) {
    const settings = (await PlatformSettings.findOne()) || {
      commissionPercentage: 10,
      baseServiceFee: 250
    };

    const commissionPercent = settings.commissionPercentage || 10;
    const baseFee = settings.baseServiceFee || 250;

    const platformCommission = Math.round(amount * (commissionPercent / 100));
    const platformFee = platformCommission + baseFee;
    const providerEarnings = Math.max(0, amount - platformCommission);
    const customerTotal = amount + baseFee;

    return {
      serviceAmount: amount,
      commissionPercent,
      platformCommission,
      baseFee,
      platformFee,
      customerTotal,
      providerEarnings
    };
  }

  // Process mock or live payment
  async processPayment({ bookingId, customerId, providerId, amount, paymentMethod = 'Mock Card / Cash' }) {
    const { platformCommission, providerEarnings } = await this.calculateFees(amount);
    const transactionId = `WM-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

    const payment = await Payment.create({
      transactionId,
      booking: bookingId,
      customer: customerId,
      provider: providerId,
      amount,
      platformCommission,
      providerEarnings,
      currency: 'LKR',
      status: PAYMENT_STATUS.PAID,
      paymentMethod,
      gatewayResponse: {
        provider: this.provider,
        authorizedAt: new Date(),
        reference: transactionId
      }
    });

    return payment;
  }

  async refundPayment(transactionId, reason = 'Customer cancellation') {
    const payment = await Payment.findOne({ transactionId });
    if (!payment) {
      throw new Error('Payment transaction not found');
    }

    payment.status = PAYMENT_STATUS.REFUNDED;
    payment.gatewayResponse = {
      ...payment.gatewayResponse,
      refundedAt: new Date(),
      refundReason: reason
    };
    await payment.save();

    return payment;
  }
}

export default new PaymentService();
