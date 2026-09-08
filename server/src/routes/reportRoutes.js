import express from 'express';
import {
  createReport,
  getReports,
  resolveReport
} from '../controllers/reportController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.post('/', protect, createReport);
router.get('/', protect, authorize(ROLES.ADMIN), getReports);
router.patch('/:id/resolve', protect, authorize(ROLES.ADMIN), resolveReport);

export default router;
