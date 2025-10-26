const { body, param } = require('express-validator');

const productValidation = [
    body('name')
        .trim()
        .notEmpty().withMessage('Product name is required')
        .isLength({ min: 3, max: 100 }).withMessage('Product name must be between 3 and 100 characters'),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 10, max: 1000 }).withMessage('Description must be between 10 and 1000 characters'),
    body('category')
        .trim()
        .notEmpty().withMessage('Category is required')
        .isIn(['milk', 'ghee', 'paneer', 'curd', 'butter', 'cheese', 'other'])
        .withMessage('Invalid category'),
    body('price')
        .notEmpty().withMessage('Price is required')
        .isFloat({ min: 0, max: 100000 }).withMessage('Price must be between 0 and 100000'),
    body('unit')
        .optional()
        .isIn(['liter', 'kg', 'gram', 'ml', 'piece', 'packet'])
        .withMessage('Invalid unit'),
    body('stock')
        .notEmpty().withMessage('Stock is required')
        .isInt({ min: 0 }).withMessage('Stock must be a positive integer'),
    body('isOrganic')
        .optional()
        .isBoolean().withMessage('isOrganic must be true or false'),
    body('farmSource')
        .optional()
        .trim()
        .isLength({ max: 200 }).withMessage('Farm source cannot exceed 200 characters')
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

const idValidation = [
    param('id')
        .isMongoId().withMessage('Invalid product ID')
];

module.exports = {
    productValidation,
    productUpdateValidation,
    idValidation
};
