// validations/product.validator.js
const { body, param, query } = require('express-validator');

const createProductValidation = [
    body('name')
        .trim()
        .toLowerCase()
        .notEmpty().withMessage('Product name is required')
        .bail()
        .isLength({ min: 3, max: 100 }).withMessage('Product name must be between 3 and 100 characters'),

    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .bail()
        .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),

    body('category')
        .trim()
        .notEmpty().withMessage('Category is required')
        .isIn(['milk', 'cheese', 'yogurt', 'butter', 'cream', 'paneer', 'ghee', 'other'])
        .withMessage('Invalid category'),

    body('price')
        .notEmpty().withMessage('Price is required')
        .isFloat({ min: 0.01 }).withMessage('Price must be greater than 0')
        .toFloat(),

    body('unit')
        .trim()
        .notEmpty().withMessage('Unit is required')
        .isIn(['liter', 'kg', 'gram', 'ml', 'piece', 'packet'])
        .withMessage('Invalid unit'),

    body('stock')
        .notEmpty().withMessage('Stock is required')
        .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer')
        .toInt(),

    body('image')
        .optional()
        .isURL().withMessage('Image must be a valid URL'),

    body('isOrganic')
        .optional()
        .isBoolean().withMessage('isOrganic must be a boolean')
        .toBoolean(),

    body('farmSource')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Farm source must not exceed 200 characters')
];


const productUpdateValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 }).withMessage('Product name must be between 3 and 100 characters'),
    body('description')
        .optional()
        .trim()
        .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
    body('category')
        .optional()
        .trim()
        .isIn(['milk', 'ghee', 'paneer', 'curd', 'butter', 'cheese', 'other'])
        .withMessage('Invalid category'),
    body('price')
        .optional()
        .isFloat({ min: 0, max: 100000 }).withMessage('Price must be between 0 and 100000'),
    body('unit')
        .optional()
        .isIn(['liter', 'kg', 'gram', 'ml', 'piece', 'packet'])
        .withMessage('Invalid unit'),
    body('stock')
        .optional()
        .isInt({ min: 0 }).withMessage('Stock must be a positive integer'),
    body('isOrganic')
        .optional()
        .isBoolean().withMessage('isOrganic must be true or false'),
    body('farmSource')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Farm source cannot exceed 200 characters')
];

const stockUpdateValidation = [
    body('stock')
        .notEmpty().withMessage('Stock is required')
        .isInt({ min: 0 }).withMessage('Stock must be a positive integer'),
    body('operation')
        .optional()
        .isIn(['set', 'add', 'subtract']).withMessage('Operation must be set, add, or subtract')
];

const bulkDeleteValidation = [
    body('productIds')
        .isArray({ min: 1 }).withMessage('Product IDs array is required and must not be empty')
        .custom((value) => {
            return value.every(id => /^[0-9a-fA-F]{24}$/.test(id));
        }).withMessage('All product IDs must be valid MongoDB ObjectIds')
];

const bulkStockUpdateValidation = [
    body('updates')
        .isArray({ min: 1 }).withMessage('Updates array is required')
        .custom((updates) => {
            return updates.every(item =>
                item.productId &&
                /^[0-9a-fA-F]{24}$/.test(item.productId) &&
                typeof item.stock === 'number' &&
                item.stock >= 0
            );
        }).withMessage('Each update must have valid productId and stock')
];


const categoryValidation = [
    param('category')
        .isIn(['milk', 'ghee', 'paneer', 'curd', 'butter', 'cheese', 'other'])
        .withMessage('Invalid category')
];



module.exports = {
    createProductValidation,
    productUpdateValidation,
    stockUpdateValidation,
    bulkDeleteValidation,
    bulkStockUpdateValidation,
    categoryValidation,

};