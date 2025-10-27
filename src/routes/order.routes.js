const express = require('express');
const orderRouter = express.Router();
const userMiddleware = require('../middlewares/auth.middleware');
const orderController = require('../controllers/order.controller');

orderRouter.post('/create', userMiddleware.isAuthorized, orderController.createRazorpayOrder);
orderRouter.get('/:paymentId', userMiddleware.isAuthorized, orderController.getPaymentDetails);
orderRouter.post('/webhook', orderController.handleWebhook);
orderRouter.post('/refund/:paymentId', orderController.refundPayment);



module.exports = orderRouter;