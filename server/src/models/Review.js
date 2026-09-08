import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
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
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true // Prevents duplicate reviews for the same booking
    },
    rating: {
      type: Number,
      required: [true, 'Please provide an overall rating between 1 and 5'],
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: [true, 'Please provide a written review of your experience'],
      trim: true,
      maxlength: [1000, 'Review cannot exceed 1000 characters']
    },
    subRatings: {
      quality: { type: Number, min: 1, max: 5 },
      professionalism: { type: Number, min: 1, max: 5 },
      communication: { type: Number, min: 1, max: 5 },
      punctuality: { type: Number, min: 1, max: 5 },
      value: { type: Number, min: 1, max: 5 },
      // Driver specific sub-ratings
      drivingSkill: { type: Number, min: 1, max: 5 },
      safety: { type: Number, min: 1, max: 5 }
    },
    isHidden: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

reviewSchema.index({ provider: 1, createdAt: -1 });
reviewSchema.index({ isHidden: 1 });

export default mongoose.model('Review', reviewSchema);
