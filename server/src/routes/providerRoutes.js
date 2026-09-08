import express from 'express';
import {
  getProviders,
  getProviderById,
  updateMyProviderProfile,
  getProviderDashboardStats
} from '../controllers/providerController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.get('/', getProviders);
router.get('/dashboard-stats', protect, authorize(ROLES.PROVIDER, ROLES.ADMIN), getProviderDashboardStats);
router.get('/:id', getProviderById);
router.put('/profile', protect, authorize(ROLES.PROVIDER, ROLES.ADMIN), updateMyProviderProfile);

export default router;
