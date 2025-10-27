const express = require('express');
const cartRouter = express.Router();
const cartController = require('../controllers/cart.controller');
const cartValidation = require('../validations/cart.validator');
const userMiddleware = require('../middlewares/auth.middleware');

cartRouter.post('/add', userMiddleware.isAuthorized, cartValidation.addToCartValidation, cartController.addToCart);

cartRouter.delete('/remove/:productId', userMiddleware.isAuthorized, cartValidation.addToCartValidation, cartController.removeFromCart);

cartRouter.put('/update', userMiddleware.isAuthorized, cartValidation.updateCartValidation, cartController.updateCartItem);

cartRouter.get('/', userMiddleware.isAuthorized, cartController.getCart);

cartRouter.get('/count', userMiddleware.isAuthorized, cartController.getCartCount);

cartRouter.delete('/clear', userMiddleware.isAuthorized, cartController.clearCart);


module.exports = cartRouter;