const { body, param } = require('express-validator');

const createOrderValidation = [
    body('shippingAddress.street')
        .trim()
        .notEmpty().withMessage('Street address is required')
        .isLength({ min: 5, max: 200 }).withMessage('Street address must be between 5 and 200 characters'),
    body('shippingAddress.city')
        .trim()
        .notEmpty().withMessage('City is required')
        .isLength({ min: 2, max: 50 }).withMessage('City must be between 2 and 50 characters'),
    body('shippingAddress.state')
        .trim()
        .notEmpty().withMessage('State is required')
        .isLength({ min: 2, max: 50 }).withMessage('State must be between 2 and 50 characters'),
    body('shippingAddress.pincode')
        .trim()
        .notEmpty().withMessage('Pincode is required')
        .matches(/^\d{6}$/).withMessage('Pincode must be a valid 6-digit number'),
    body('shippingAddress.phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(/^[6-9]\d{9}$/).withMessage('Phone must be a valid 10-digit Indian number')
];

const orderIdValidation = [
    param('orderId')
        .trim()
        .notEmpty().withMessage('Order ID is required')
        .isLength({ min: 10, max: 30 }).withMessage('Invalid order ID')
];

const updateOrderStatusValidation = [
    body('orderStatus')
        .notEmpty().withMessage('Order status is required')
        .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
        .withMessage('Invalid order status'),
    body('deliveryDate')
        .optional()
        .isISO8601().withMessage('Invalid delivery date format')
];

module.exports = {
    createOrderValidation,
    orderIdValidation,
    updateOrderStatusValidation
};