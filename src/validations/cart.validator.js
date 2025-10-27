const { body } = require('express-validator');

const addToCartValidation = [
    body('productId')
        .notEmpty().withMessage('Product ID is required')
        .isMongoId().withMessage('Invalid product ID format'),

    body('quantity')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Quantity must be between 1 and 100')
];

const updateCartValidation = [
    body('productId')
        .notEmpty().withMessage('Product ID is required')
        .isMongoId().withMessage('Invalid product ID format'),

    body('quantity')
        .notEmpty().withMessage('Quantity is required')
        .isInt({ min: 1, max: 100 })
        .withMessage('Quantity must be between 1 and 100')
];

const mergeCartValidation = [
    body('guestCartItems')
        .notEmpty().withMessage('Guest cart items are required')
        .isArray().withMessage('Guest cart items must be an array'),

    body('guestCartItems.*.productId')
        .notEmpty().withMessage('Product ID required')
        .isMongoId().withMessage('Invalid product ID'),

    body('guestCartItems.*.quantity')
        .notEmpty().withMessage('Quantity required')
        .isInt({ min: 1, max: 100 })
        .withMessage('Quantity must be between 1 and 100')
];

module.exports = {
    mergeCartValidation,
    updateCartValidation,
    addToCartValidation
};
