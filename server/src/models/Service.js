import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide service title'],
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true
    },
    subcategory: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      required: true
    },
    pricingType: {
      type: String,
      enum: ['fixed', 'hourly', 'quote_based'],
      default: 'fixed'
    },
    basePrice: {
      type: Number,
      required: true,
      default: 2500 // LKR
    },
    estimatedDurationMinutes: {
      type: Number,
      default: 120
    },
    icon: {
      type: String,
      default: 'Wrench'
    },
    image: {
      type: String,
      default: ''
    },
    popular: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

serviceSchema.index({ category: 1 });
serviceSchema.index({ popular: 1 });

export default mongoose.model('Service', serviceSchema);
