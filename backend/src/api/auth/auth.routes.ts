import { Router } from 'express';
import { login, registerPharmacist, registerPharmacyOwner } from './auth.controller';
import { validateRegisterPharmacist, validateRegisterPharmacyOwner, validateLogin } from './auth.validator';

const router = Router();

// Register routes
router.post('/register/pharmacist', validateRegisterPharmacist, registerPharmacist);
router.post('/register/pharmacy-owner', validateRegisterPharmacyOwner, registerPharmacyOwner);

// Login route (common for both roles)
router.post('/login', validateLogin, login);

export default router;