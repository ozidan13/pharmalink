"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSearchParams = void 0;
const express_validator_1 = require("express-validator");
// Validation for product search parameters
exports.validateSearchParams = [
    // Optional search query
    (0, express_validator_1.query)('q')
        .optional()
        .isString()
        .withMessage('Search query must be a string'),
    // Optional category filter
    (0, express_validator_1.query)('category')
        .optional()
        .isString()
        .withMessage('Category must be a string'),
    // Optional near expiry filter
    (0, express_validator_1.query)('nearExpiry')
        .optional()
        .isIn(['true', 'false'])
        .withMessage('Near expiry must be true or false'),
    // Optional price range filters
    (0, express_validator_1.query)('minPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Minimum price must be a positive number'),
    (0, express_validator_1.query)('maxPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Maximum price must be a positive number')
        .custom((value, { req }) => {
        const minPrice = req.query.minPrice ? parseFloat(req.query.minPrice) : 0;
        const maxPrice = parseFloat(value);
        if (maxPrice < minPrice) {
            throw new Error('Maximum price must be greater than or equal to minimum price');
        }
        return true;
    }),
    // Pagination parameters
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
];
