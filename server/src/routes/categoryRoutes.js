import express from 'express';
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { protect } from '../middleware/auth.js';
import { authorize } from '../middleware/role.js';
import { ROLES } from '../config/constants.js';

const router = express.Router();

router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);
router.post('/', protect, authorize(ROLES.ADMIN), createCategory);
router.put('/:id', protect, authorize(ROLES.ADMIN), updateCategory);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteCategory);

export default router;
