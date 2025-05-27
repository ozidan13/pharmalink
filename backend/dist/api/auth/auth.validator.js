"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLogin = exports.validateRegisterPharmacyOwner = exports.validateRegisterPharmacist = void 0;
const express_validator_1 = require("express-validator");
// Validation for pharmacist registration
exports.validateRegisterPharmacist = [
    // Email validation
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    // Password validation
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    // Required fields validation
    (0, express_validator_1.body)('firstName')
        .notEmpty()
        .withMessage('First name is required'),
    (0, express_validator_1.body)('lastName')
        .notEmpty()
        .withMessage('Last name is required'),
    // Optional fields validation
    (0, express_validator_1.body)('phoneNumber')
        .optional()
        .isMobilePhone('any')
        .withMessage('Please provide a valid phone number'),
    (0, express_validator_1.body)('bio')
        .optional()
        .isString()
        .withMessage('Bio must be a string'),
    (0, express_validator_1.body)('experience')
        .optional()
        .isString()
        .withMessage('Experience must be a string'),
    (0, express_validator_1.body)('education')
        .optional()
        .isString()
        .withMessage('Education must be a string'),
    // Location validation
    (0, express_validator_1.body)('latitude')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    (0, express_validator_1.body)('longitude')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180')
];
// Validation for pharmacy owner registration
exports.validateRegisterPharmacyOwner = [
    // Email validation
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    // Password validation
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    // Required fields validation
    (0, express_validator_1.body)('pharmacyName')
        .notEmpty()
        .withMessage('Pharmacy name is required'),
    (0, express_validator_1.body)('contactPerson')
        .notEmpty()
        .withMessage('Contact person name is required'),
    // Optional fields validation
    (0, express_validator_1.body)('phoneNumber')
        .optional()
        .isMobilePhone('any')
        .withMessage('Please provide a valid phone number'),
    (0, express_validator_1.body)('address')
        .optional()
        .isString()
        .withMessage('Address must be a string'),
    // Location validation
    (0, express_validator_1.body)('latitude')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    (0, express_validator_1.body)('longitude')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180')
];
// Validation for login
exports.validateLogin = [
    // Email validation
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),
    // Password validation
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required')
];
