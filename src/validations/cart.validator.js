const { body, param } = require('express-validator');

const addToCartValidation = [
    body('productId')
        .notEmpty().withMessage('Product ID is required')
        .isMongoId().withMessage('Invalid product ID'),
    body('quantity')
        .notEmpty().withMessage('Quantity is required')
        .isInt({ min: 1, max: 100 }).withMessage('Quantity must be between 1 and 100')
];

const updateCartValidation = [
    param('productId')
        .isMongoId().withMessage('Invalid product ID'),
    body('quantity')
        .notEmpty().withMessage('Quantity is required')
        .isInt({ min: 0, max: 100 }).withMessage('Quantity must be between 0 and 100')
];

const removeFromCartValidation = [
    param('productId')
        .isMongoId().withMessage('Invalid product ID')
];

module.exports = {
    addToCartValidation,
    updateCartValidation,
    removeFromCartValidation
};