import express from 'express';
import {
  uploadImage,
  uploadAvatar,
  uploadDocument,
  deleteUpload
} from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';
import { uploadPublic, uploadProtected } from '../middleware/upload.js';

const router = express.Router();

// All upload routes require authentication
router.post('/image', protect, uploadPublic.single('file'), uploadImage);
router.post('/avatar', protect, uploadPublic.single('file'), uploadAvatar);
router.post('/document', protect, uploadProtected.single('file'), uploadDocument);
router.delete('/:publicId', protect, deleteUpload);

export default router;
