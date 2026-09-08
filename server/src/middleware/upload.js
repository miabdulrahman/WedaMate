import multer from 'multer';
import path from 'path';

// Use memory storage for Cloudinary uploads (no filesystem needed)
const memoryStorage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|pdf/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only images (jpg, png, webp) and PDF documents are allowed'));
  }
};

// Public uploads (avatars, portfolio images)
export const uploadPublic = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

// Protected uploads (KYC documents)
export const uploadProtected = multer({
  storage: memoryStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for KYC docs
  fileFilter
});
