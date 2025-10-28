const express = require('express');
const productRouter = express.Router();
const upload = require('../config/multerConfig');
const productValidation = require('../validations/product.validator');
const productController = require('../controllers/product.controller');
const userMiddleware = require('../middlewares/auth.middleware');

productRouter.post('/create', userMiddleware.isAuthorized, userMiddleware.isAdmin, upload.single('image'), productValidation.createProductValidation, productController.createProduct);
productRouter.get('/', productController.getAllProducts);
productRouter.put('/:id', userMiddleware.isAuthorized, userMiddleware.isAdmin, productValidation.productUpdateValidation, productController.updateProduct);
productRouter.get('/:id', userMiddleware.isAuthorized, productController.getProductById)
module.exports = productRouter;