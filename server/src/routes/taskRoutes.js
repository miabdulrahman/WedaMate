import express from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  submitBid,
  acceptBid
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.post('/', protect, createTask);
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/:id/bid', protect, authorize(ROLES.PROVIDER, ROLES.DRIVER), submitBid);
router.post('/:id/accept-bid', protect, acceptBid);

export default router;
