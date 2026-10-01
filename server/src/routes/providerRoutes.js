import express from 'express';
import {
  getProviders,
  getProviderById,
  updateMyProviderProfile,
  getProviderDashboardStats,
  getMyProviderProfile,
  addProviderService,
  updateProviderService,
  deleteProviderService
} from '../controllers/providerController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.get('/', getProviders);
router.get('/me', protect, authorize(ROLES.PROVIDER, ROLES.ADMIN), getMyProviderProfile);
router.get('/dashboard-stats', protect, authorize(ROLES.PROVIDER, ROLES.ADMIN), getProviderDashboardStats);
router.put('/profile', protect, authorize(ROLES.PROVIDER, ROLES.ADMIN), updateMyProviderProfile);

// Provider individual services management
router.post('/services', protect, authorize(ROLES.PROVIDER, ROLES.ADMIN), addProviderService);
router.put('/services/:serviceId', protect, authorize(ROLES.PROVIDER, ROLES.ADMIN), updateProviderService);
router.delete('/services/:serviceId', protect, authorize(ROLES.PROVIDER, ROLES.ADMIN), deleteProviderService);

// Public provider by ID (User ID or ProviderProfile ID)
router.get('/:id', getProviderById);

export default router;
