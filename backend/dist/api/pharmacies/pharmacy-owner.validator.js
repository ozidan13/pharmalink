"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSubscription = exports.validateUpdateProfile = void 0;
const express_validator_1 = require("express-validator");
// Validation for updating pharmacy owner profile
exports.validateUpdateProfile = [
    // Optional fields validation
    (0, express_validator_1.body)('pharmacyName')
        .optional()
        .notEmpty()
        .withMessage('Pharmacy name cannot be empty'),
    (0, express_validator_1.body)('contactPerson')
        .optional()
        .notEmpty()
        .withMessage('Contact person name cannot be empty'),
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
// Validation for subscription update
exports.validateSubscription = [
    (0, express_validator_1.body)('planType')
        .notEmpty()
        .withMessage('Plan type is required')
        .isIn(['none', 'basic', 'premium'])
        .withMessage('Plan type must be one of: none, basic, premium')
];
