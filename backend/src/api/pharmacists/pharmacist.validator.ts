import { query, body } from 'express-validator';

// Validation for updating pharmacist profile
export const validateUpdateProfile = [
  // Optional fields validation
  body('firstName')
    .optional()
    .notEmpty()
    .withMessage('First name cannot be empty'),
  
  body('lastName')
    .optional()
    .notEmpty()
    .withMessage('Last name cannot be empty'),
  
  body('phoneNumber')
    .optional()
    .isMobilePhone('any')
    .withMessage('Please provide a valid phone number'),
  
  body('bio')
    .optional()
    .isString()
    .withMessage('Bio must be a string'),
  
  body('experience')
    .optional()
    .isString()
    .withMessage('Experience must be a string'),
  
  body('education')
    .optional()
    .isString()
    .withMessage('Education must be a string'),
  
  // Location validation
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  
  body('available')
    .optional()
    .isBoolean()
    .withMessage('Available must be a boolean value')
];

// Validation for search parameters
export const validateSearchParams = [
  query('latitude')
    .notEmpty()
    .withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be between -90 and 90'),
  
  query('longitude')
    .notEmpty()
    .withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be between -180 and 180'),
  
  query('radius')
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage('Radius must be between 0 and 100 kilometers'),
  
  query('available')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('Available must be true or false')
];