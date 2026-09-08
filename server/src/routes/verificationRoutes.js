import express from 'express';
import {
  submitVerification,
  getMyVerificationStatus,
  adminGetVerifications,
  adminReviewVerification
} from '../controllers/verificationController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.post('/submit', protect, submitVerification);
router.get('/my-status', protect, getMyVerificationStatus);
router.get('/admin', protect, authorize(ROLES.ADMIN), adminGetVerifications);
router.patch('/admin/:id', protect, authorize(ROLES.ADMIN), adminReviewVerification);

export default router;
