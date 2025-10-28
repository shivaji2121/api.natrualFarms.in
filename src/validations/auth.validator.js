const { body } = require('express-validator');

const signupValidation = [
    body('name')
        .trim()
        .toLowerCase()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid 10-digit Indian phone number'),
    body('address.street')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Street address cannot exceed 200 characters'),
    body('address.city')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('City name cannot exceed 50 characters'),
    body('address.state')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('State name cannot exceed 50 characters'),
    body('address.pincode')
        .optional()
        .trim()
        .matches(/^\d{6}$/).withMessage('Pincode must be a valid 6-digit number')
];

const loginValidation = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required').bail()
        .isEmail().withMessage('Please provide a valid email address')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
];

const passwordValidation = [
    body('password')
        .notEmpty().withMessage('Password is required')
];

const profileUpdateValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
    body('phone')
        .optional()
        .trim()
        .matches(/^[6-9]\d{9}$/).withMessage('Please provide a valid 10-digit Indian phone number'),
    body('address.street')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Street address cannot exceed 200 characters'),
    body('address.city')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('City name cannot exceed 50 characters'),
    body('address.state')
        .optional()
        .trim()
        .isLength({ max: 50 }).withMessage('State name cannot exceed 50 characters'),
    body('address.pincode')
        .optional()
        .trim()
        .matches(/^\d{6}$/).withMessage('Pincode must be a valid 6-digit number')
];


module.exports = {
    signupValidation,
    loginValidation,
    profileUpdateValidation,
    passwordValidation
};