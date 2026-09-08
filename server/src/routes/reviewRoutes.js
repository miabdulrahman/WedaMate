import express from 'express';
import {
  createReview,
  getProviderReviews,
  moderateReview,
  getAllReviews
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.get('/', protect, authorize(ROLES.ADMIN), getAllReviews);
router.post('/', protect, createReview);
router.get('/provider/:providerId', getProviderReviews);
router.patch('/:id/moderate', protect, authorize(ROLES.ADMIN), moderateReview);

export default router;
