import { Router } from 'express';
import { getProfile, updateProfile, getPharmacistById, searchPharmacists, uploadCV } from './pharmacist.controller';
import { authenticate, isPharmacist, isPharmacyOwner } from '../../middleware/auth.middleware';
import { validateUpdateProfile, validateSearchParams } from './pharmacist.validator';
import multer from 'multer';
import path from 'path';

const router = Router();

// Configure multer for CV uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/cvs');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    const filetypes = /pdf|doc|docx/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
  }
});

// Pharmacist routes (protected by authentication)
router.get('/me', authenticate, isPharmacist, getProfile);
router.put('/me', authenticate, isPharmacist, validateUpdateProfile, updateProfile);
router.post('/me/cv', authenticate, isPharmacist, upload.single('cv'), uploadCV);

// Routes for pharmacy owners
router.get('/search', authenticate, isPharmacyOwner, validateSearchParams, searchPharmacists);
router.get('/:id', authenticate, isPharmacyOwner, getPharmacistById);

export default router;