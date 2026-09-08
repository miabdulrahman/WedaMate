import multer from 'multer';
import path from 'path';
import storageService from '../services/storageService.js';

const publicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageService.getPublicUploadPath());
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

const protectedStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageService.getProtectedUploadPath());
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `kyc-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|pdf/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only images (jpg, png, webp) and PDF documents are allowed'));
  }
};

export const uploadPublic = multer({
  storage: publicStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

export const uploadProtected = multer({
  storage: protectedStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit for KYC docs
  fileFilter
});
