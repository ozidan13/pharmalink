"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_validator_1 = require("./auth.validator");
const router = (0, express_1.Router)();
// Register routes
router.post('/register/pharmacist', auth_validator_1.validateRegisterPharmacist, auth_controller_1.registerPharmacist);
router.post('/register/pharmacy-owner', auth_validator_1.validateRegisterPharmacyOwner, auth_controller_1.registerPharmacyOwner);
// Login route (common for both roles)
router.post('/login', auth_validator_1.validateLogin, auth_controller_1.login);
exports.default = router;
