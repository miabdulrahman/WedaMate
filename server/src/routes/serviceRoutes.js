import express from 'express';
import {
  getServices,
  getServiceBySlug,
  createService,
  updateService,
  deleteService
} from '../controllers/serviceController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.get('/', getServices);
router.get('/:slug', getServiceBySlug);
router.post('/', protect, authorize(ROLES.ADMIN, ROLES.PROVIDER), createService);
router.put('/:id', protect, authorize(ROLES.ADMIN), updateService);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteService);

export default router;
