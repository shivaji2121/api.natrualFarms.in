const express = require('express');
const orderRouter = express.Router();
const userMiddleware = require('../middlewares/auth.middleware');
const orderController = require('../controllers/order.controller');

orderRouter.get('/', userMiddleware.isAuthorized, userMiddleware.isAdmin, orderController.getAllOrders);
orderRouter.post('/create', userMiddleware.isAuthorized, orderController.createRazorpayOrder);
orderRouter.post('/webhook', orderController.handleWebhook);
orderRouter.post('/refund/:paymentId', orderController.refundPayment);
orderRouter.get('/:paymentId', userMiddleware.isAuthorized, orderController.getPaymentDetails);



module.exports = orderRouter;