import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { 
  getProfile, 
  updateProfile, 
  getPharmacistById, 
  searchPharmacists, 
  uploadCV 
} from './pharmacist.controller';
import { 
  authenticate, 
  isPharmacist, 
  isPharmacyOwner 
} from '../../middleware/auth.middleware';
import { 
  validateUpdateProfile, 
  validateSearchParams 
} from './pharmacist.validator';

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

// Apply authentication to all routes that need it
router.use(authenticate);

/**
 * @route   GET /api/pharmacists/me
 * @desc    Get current pharmacist's profile
 * @access  Private (Pharmacist)
 */
router.get('/me', isPharmacist, getProfile);

/**
 * @route   PUT /api/pharmacists/me
 * @desc    Update current pharmacist's profile
 * @access  Private (Pharmacist)
 */
router.put('/me', isPharmacist, validateUpdateProfile, updateProfile);

/**
 * @route   POST /api/pharmacists/me/cv
 * @desc    Upload/update pharmacist's CV
 * @access  Private (Pharmacist)
 */
router.post('/me/cv', isPharmacist, upload.single('cv'), uploadCV);

/**
 * @route   GET /api/pharmacists/search
 * @desc    Search for pharmacists (public)
 * @access  Public
 */
router.get('/search', validateSearchParams, searchPharmacists);

/**
 * @route   GET /api/pharmacists/:id
 * @desc    Get pharmacist by ID (for pharmacy owners)
 * @access  Private (Pharmacy Owner)
 */
router.get('/:id', isPharmacyOwner, getPharmacistById);

export default router;