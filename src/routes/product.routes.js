const express = require('express');
const productRouter = express.Router();
const upload = require('../config/multerConfig');
const productValidation = require('../validations/product.validator');
const productController = require('../controllers/product.controller');
const userMiddleware = require('../middlewares/auth.middleware');

productRouter.post('/create', userMiddleware.isAuthorized, userMiddleware.isAdmin, upload.single('image'), productValidation.createProductValidation, productController.createProduct);


module.exports = productRouter;