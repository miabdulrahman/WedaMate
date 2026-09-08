import express from 'express';
import {
  getDrivers,
  getDriverById,
  updateMyDriverProfile,
  toggleDriverAvailability,
  getDriverDashboardStats
} from '../controllers/driverController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.get('/', getDrivers);
router.get('/dashboard-stats', protect, authorize(ROLES.DRIVER, ROLES.ADMIN), getDriverDashboardStats);
router.get('/:id', getDriverById);
router.put('/profile', protect, authorize(ROLES.DRIVER, ROLES.ADMIN), updateMyDriverProfile);
router.patch('/toggle-availability', protect, authorize(ROLES.DRIVER, ROLES.ADMIN), toggleDriverAvailability);

export default router;
