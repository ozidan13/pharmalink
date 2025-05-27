import { body } from 'express-validator';

// Validation for updating pharmacy owner profile
export const validateUpdateProfile = [
  // Optional fields validation
  body('pharmacyName')
    .optional()
    .notEmpty()
    .withMessage('Pharmacy name cannot be empty'),
  
  body('contactPerson')
    .optional()
    .notEmpty()
    .withMessage('Contact person name cannot be empty'),
  
  body('phoneNumber')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  
  body('address')
    .optional()
    .isString()
    .withMessage('Address must be a string'),
  
  // Location validation
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180')
];

// Validation for subscription update
export const validateSubscription = [
  body('planType')
    .notEmpty()
    .withMessage('Plan type is required')
    .isIn(['none', 'basic', 'premium'])
    .withMessage('Plan type must be one of: none, basic, premium')
];