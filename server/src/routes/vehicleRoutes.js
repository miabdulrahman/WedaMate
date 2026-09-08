import express from 'express';
import {
  getMyVehicles,
  addVehicle,
  updateVehicle,
  deleteVehicle
} from '../controllers/vehicleController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getMyVehicles);
router.post('/', protect, addVehicle);
router.put('/:id', protect, updateVehicle);
router.delete('/:id', protect, deleteVehicle);

export default router;
