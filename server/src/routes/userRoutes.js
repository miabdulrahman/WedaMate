import express from 'express';
import {
  toggleSaveProvider,
  getSavedProviders,
  addAddress,
  removeAddress
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/saved-providers', protect, getSavedProviders);
router.post('/saved-providers/:providerId', protect, toggleSaveProvider);
router.post('/addresses', protect, addAddress);
router.delete('/addresses/:id', protect, removeAddress);

export default router;
