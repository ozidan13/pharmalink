"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const pharmacy_owner_controller_1 = require("./pharmacy-owner.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const pharmacy_owner_validator_1 = require("./pharmacy-owner.validator");
const router = (0, express_1.Router)();
// Pharmacy owner routes (protected by authentication)
router.get('/me', auth_middleware_1.authenticate, auth_middleware_1.isPharmacyOwner, pharmacy_owner_controller_1.getProfile);
router.put('/me', auth_middleware_1.authenticate, auth_middleware_1.isPharmacyOwner, pharmacy_owner_validator_1.validateUpdateProfile, pharmacy_owner_controller_1.updateProfile);
router.post('/me/subscribe', auth_middleware_1.authenticate, auth_middleware_1.isPharmacyOwner, pharmacy_owner_validator_1.validateSubscription, pharmacy_owner_controller_1.updateSubscription);
exports.default = router;
