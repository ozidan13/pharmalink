"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSearchParams = exports.validateUpdateProfile = void 0;
const express_validator_1 = require("express-validator");
// Validation for updating pharmacist profile
exports.validateUpdateProfile = [
    // Optional fields validation
    (0, express_validator_1.body)('firstName')
        .optional()
        .notEmpty()
        .withMessage('First name cannot be empty'),
    (0, express_validator_1.body)('lastName')
        .optional()
        .notEmpty()
        .withMessage('Last name cannot be empty'),
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
        .withMessage('Longitude must be between -180 and 180'),
    (0, express_validator_1.body)('available')
        .optional()
        .isBoolean()
        .withMessage('Available must be a boolean value')
];
// Validation for search parameters
exports.validateSearchParams = [
    (0, express_validator_1.query)('latitude')
        .notEmpty()
        .withMessage('Latitude is required')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    (0, express_validator_1.query)('longitude')
        .notEmpty()
        .withMessage('Longitude is required')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
    (0, express_validator_1.query)('radius')
        .optional()
        .isFloat({ min: 0, max: 100 })
        .withMessage('Radius must be between 0 and 100 kilometers'),
    (0, express_validator_1.query)('available')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('Available must be true or false')
];
