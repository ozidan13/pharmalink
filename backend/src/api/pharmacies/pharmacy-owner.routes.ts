import { Router } from 'express';
import { getProfile, updateProfile, updateSubscription } from './pharmacy-owner.controller';
import { authenticate, isPharmacyOwner } from '../../middleware/auth.middleware';
import { validateUpdateProfile, validateSubscription } from './pharmacy-owner.validator';

const router = Router();

// Pharmacy owner routes (protected by authentication)
router.get('/me', authenticate, isPharmacyOwner, getProfile);
router.put('/me', authenticate, isPharmacyOwner, validateUpdateProfile, updateProfile);
router.post('/me/subscribe', authenticate, isPharmacyOwner, validateSubscription, updateSubscription);

export default router;