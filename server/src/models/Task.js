import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    message: String,
    estimatedDays: Number,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }
);

const taskSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    },
    description: {
      type: String,
      required: true
    },
    location: {
      city: { type: String, required: true },
      district: { type: String, required: true },
      address: String
    },
    budget: {
      type: Number,
      required: true
    },
    preferredDate: Date,
    images: [String],
    bids: [bidSchema],
    status: {
      type: String,
      enum: ['open', 'assigned', 'completed', 'cancelled'],
      default: 'open'
    },
    assignedProvider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    }
  },
  {
    timestamps: true
  }
);

taskSchema.index({ customer: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ 'location.city': 1 });

export default mongoose.model('Task', taskSchema);
