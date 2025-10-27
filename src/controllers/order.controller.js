const razorpay = require('../config/razorpay.config');
const crypto = require('crypto');
const Order = require('../models/order.model');
const orderService = require('../services/order.service');
const paginationService = require('../utils/paginationHelper');

// Create Razorpay order
module.exports.createRazorpayOrder = async (req, res, next) => {
    try {
        const orderData = req.body;

        // Step 1: Generate unique order ID
        const orderId = `ORD${Date.now()}${Math.random().toString(36).toUpperCase()}`;

        // Step 2: Create order in database
        const order = new Order({
            ...orderData,
            orderId: orderId,
            user: req.user.id,
            paymentStatus: 'pending',
            orderStatus: 'pending'
        });

        await order.save();

        // Step 3: Create Razorpay order
        const razorpayOptions = {
            amount: order.totalAmount * 100,
            currency: 'INR',
            receipt: order.orderId,
            notes: {
                orderId: order.orderId,
                userId: req.user.id
            }
        };
        console.log('razorpayOptions: ', razorpayOptions);

        const razorpayOrder = await razorpay.orders.create(razorpayOptions);

        // Step 4: Update order with Razorpay order ID
        order.razorpayOrderId = razorpayOrder.id;
        await order.save();

        // Step 5: Populate and return
        await order.populate('user', 'name email');
        await order.populate('items.product', 'name category');

        res.status(201).json({
            success: true,
            message: 'Order created and payment initiated',
            data: {
                order: order,
                razorpayOrderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                currency: razorpayOrder.currency,
                key_id: process.env.RAZORPAY_KEY_ID
            }
        });
    } catch (error) {
        console.error('Order Creation Error:', error);
        res.status(500).json({ success: false, message: 'Error creating order', error: error.message });
    }
};


// Verify Razorpay payment signature
module.exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            orderId
        } = req.body;

        // Generate signature
        const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');

        // Verify signature
        if (generatedSignature === razorpay_signature) {
            // Update order in database
            const order = await Order.findOne({ orderId: orderId.toUpperCase() });

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: 'Order not found'
                });
            }

            order.paymentStatus = 'completed';
            order.paymentId = razorpay_payment_id;
            order.razorpayOrderId = razorpay_order_id;
            order.orderStatus = 'confirmed';
            await order.save();

            res.status(200).json({
                success: true,
                message: 'Payment verified successfully',
                data: {
                    orderId: order.orderId,
                    paymentId: razorpay_payment_id,
                    paymentStatus: 'completed'
                }
            });
        } else {
            // Payment verification failed
            const order = await Order.findOne({ orderId: orderId.toUpperCase() });
            if (order) {
                order.paymentStatus = 'failed';
                await order.save();
            }

            res.status(400).json({
                success: false,
                message: 'Payment verification failed',
                error: 'Invalid signature'
            });
        }
    } catch (error) {
        console.error('Payment Verification Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error verifying payment',
            error: error.message
        });
    }
};

// Handle payment failure
exports.paymentFailed = async (req, res) => {
    try {
        const { orderId, error } = req.body;

        const order = await Order.findOne({ orderId: orderId.toUpperCase() });

        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        order.paymentStatus = 'failed';
        await order.save();

        res.status(200).json({
            success: true,
            message: 'Payment failure recorded',
            data: {
                orderId: order.orderId,
                paymentStatus: 'failed',
                error: error
            }
        });
    } catch (error) {
        console.error('Payment Failure Handling Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error handling payment failure',
            error: error.message
        });
    }
};

module.exports.getPaymentDetails = async (req, res) => {
    try {
        const { paymentId } = req.params;
        console.log('paymentId: ', paymentId);

        const payment = await razorpay.payments.fetch(paymentId);
        console.log('payment: ', payment);

        res.status(200).json({
            success: true,
            data: payment
        });
    } catch (error) {
        console.error('Get Payment Details Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching payment details',
            error: error.message
        });
    }
};

// Refund payment
module.exports.refundPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { amount, notes } = req.body;

        // Fetch payment details first
        const payment = await razorpay.payments.fetch(paymentId);

        // Create refund
        const refundOptions = {
            amount: amount ? amount * 100 : payment.amount, // Full refund if amount not specified
            notes: notes || {}
        };

        const refund = await razorpay.payments.refund(paymentId, refundOptions);

        // Update order status
        const order = await Order.findOne({ paymentId: paymentId });
        if (order) {
            order.paymentStatus = 'failed'; // or create a new 'refunded' status
            order.orderStatus = 'cancelled';
            await order.save();
        }

        res.status(200).json({
            success: true,
            message: 'Refund processed successfully',
            data: refund
        });
    } catch (error) {
        console.error('Refund Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing refund',
            error: error.message
        });
    }
};

// Razorpay Webhook handler
module.exports.handleWebhook = async (req, res) => {
    try {
        const webhookSignature = req.headers['x-razorpay-signature'];
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac('sha256', webhookSecret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (webhookSignature !== expectedSignature) {
            return res.status(400).json({
                success: false,
                message: 'Invalid webhook signature'
            });
        }

        const event = req.body.event;
        const payload = req.body.payload.payment.entity;

        // Handle different webhook events
        switch (event) {
            case 'payment.captured':
                // Payment successful
                const order = await Order.findOne({ razorpayOrderId: payload.order_id });
                if (order) {
                    order.paymentStatus = 'completed';
                    order.paymentId = payload.id;
                    order.orderStatus = 'confirmed';
                    await order.save();
                }
                break;

            case 'payment.failed':
                // Payment failed
                const failedOrder = await Order.findOne({ razorpayOrderId: payload.order_id });
                if (failedOrder) {
                    failedOrder.paymentStatus = 'failed';
                    await failedOrder.save();
                }
                break;

            default:
                console.log(`Unhandled webhook event: ${event}`);
        }

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Webhook Error:', error);
        res.status(500).json({
            success: false,
            message: 'Webhook processing error',
            error: error.message
        });
    }
};



module.exports.getAllOrders = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.page_size) || 10;
        const search = req.query.search || '';
        const sort = req.query.sort || '-createdAt';
        const { paymentStatus, orderStatus, startDate, endDate } = req.query;

        const filter = {};

        if (search) {
            filter.$or = [
                { orderId: new RegExp(search, 'i') },
                { 'user.name': new RegExp(search, 'i') },
                { 'user.email': new RegExp(search, 'i') }
            ];
        }

        if (paymentStatus) {
            filter.paymentStatus = paymentStatus;
        }
        if (orderStatus) {
            filter.orderStatus = orderStatus;
        }

        if (startDate || endDate) {
            filter.createdAt = {};
            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.createdAt.$lte = new Date(endDate);
            }
        }

        const skip = (page - 1) * pageSize;

        const { orderRecords, totalRecords } = await orderService.getRecords(filter, sort, skip, pageSize);

        const paginationInfo = paginationService.getPaginationData(page, pageSize, totalRecords);



        return res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            data: {
                paginationInfo,
                orderRecords
            }
        });
    } catch (error) {
        console.error('Get Orders Error:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}