"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUpdateProduct = exports.validateCreateProduct = void 0;
const express_validator_1 = require("express-validator");
// Validation for creating a product
exports.validateCreateProduct = [
    // Required fields validation
    (0, express_validator_1.body)('name')
        .notEmpty()
        .withMessage('Product name is required'),
    (0, express_validator_1.body)('price')
        .notEmpty()
        .withMessage('Price is required')
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    (0, express_validator_1.body)('category')
        .notEmpty()
        .withMessage('Category is required'),
    (0, express_validator_1.body)('stock')
        .notEmpty()
        .withMessage('Stock is required')
        .isInt({ min: 0 })
        .withMessage('Stock must be a non-negative integer'),
    // Optional fields validation
    (0, express_validator_1.body)('description')
        .optional()
        .isString()
        .withMessage('Description must be a string'),
    (0, express_validator_1.body)('isNearExpiry')
        .optional()
        .isBoolean()
        .withMessage('isNearExpiry must be a boolean value'),
    (0, express_validator_1.body)('expiryDate')
        .optional()
        .isISO8601()
        .withMessage('Expiry date must be a valid date')
        .custom((value, { req }) => {
        if (req.body.isNearExpiry === true && !value) {
            throw new Error('Expiry date is required for near-expiry products');
        }
        return true;
    }),
    (0, express_validator_1.body)('imageUrl')
        .optional()
        .isURL()
        .withMessage('Image URL must be a valid URL')
];
// Validation for updating a product
exports.validateUpdateProduct = [
    // Optional fields validation
    (0, express_validator_1.body)('name')
        .optional()
        .notEmpty()
        .withMessage('Product name cannot be empty'),
    (0, express_validator_1.body)('price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Price must be a positive number'),
    (0, express_validator_1.body)('category')
        .optional()
        .notEmpty()
        .withMessage('Category cannot be empty'),
    (0, express_validator_1.body)('stock')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Stock must be a non-negative integer'),
    (0, express_validator_1.body)('description')
        .optional()
        .isString()
        .withMessage('Description must be a string'),
    (0, express_validator_1.body)('isNearExpiry')
        .optional()
        .isBoolean()
        .withMessage('isNearExpiry must be a boolean value'),
    (0, express_validator_1.body)('expiryDate')
        .optional()
        .isISO8601()
        .withMessage('Expiry date must be a valid date')
        .custom((value, { req }) => {
        if (req.body.isNearExpiry === true && !value) {
            throw new Error('Expiry date is required for near-expiry products');
        }
        return true;
    }),
    (0, express_validator_1.body)('imageUrl')
        .optional()
        .isURL()
        .withMessage('Image URL must be a valid URL')
];
