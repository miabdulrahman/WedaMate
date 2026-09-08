import express from 'express';
import {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  forgotPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/forgot-password', authLimiter, forgotPassword);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateDetails);
router.put('/update-password', protect, updatePassword);

export default router;
