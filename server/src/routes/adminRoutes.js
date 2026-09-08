import express from 'express';
import {
  getAdminAnalytics,
  getAdminUsers,
  toggleUserStatus,
  getSettings,
  updateSettings
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.use(protect);
router.use(authorize(ROLES.ADMIN));

router.get('/analytics', getAdminAnalytics);
router.get('/users', getAdminUsers);
router.patch('/users/:id/toggle-status', toggleUserStatus);
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

export default router;
