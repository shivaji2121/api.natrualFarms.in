const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product reference is required']
    },
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        minLength: [3, 'Product name must be at least 3 characters'],
        maxLength: [100, 'Product name cannot exceed 100 characters']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1'],
        max: [100, 'Quantity cannot exceed 100'],
        validate: {
            validator: Number.isInteger,
            message: 'Quantity must be a whole number'
        }
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative'],
        max: [100000, 'Price cannot exceed 100000']
    }
});

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: [true, 'Order ID is required'],
        unique: true,
        trim: true,
        uppercase: true,
        minLength: [10, 'Order ID must be at least 10 characters'],
        maxLength: [30, 'Order ID cannot exceed 30 characters']
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required']
    },
    items: {
        type: [orderItemSchema],
        validate: {
            validator: function (v) {
                return v && v.length > 0 && v.length <= 50;
            },
            message: 'Order must have between 1 and 50 items'
        }
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: [0, 'Total amount cannot be negative'],
        max: [1000000, 'Total amount cannot exceed 1000000']
    },
    shippingAddress: {
        street: {
            type: String,
            required: [true, 'Street address is required'],
            trim: true,
            minLength: [5, 'Street address must be at least 5 characters'],
            maxLength: [200, 'Street address cannot exceed 200 characters']
        },
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true,
            minLength: [2, 'City must be at least 2 characters'],
            maxLength: [50, 'City cannot exceed 50 characters']
        },
        state: {
            type: String,
            required: [true, 'State is required'],
            trim: true,
            minLength: [2, 'State must be at least 2 characters'],
            maxLength: [50, 'State cannot exceed 50 characters']
        },
        pincode: {
            type: String,
            required: [true, 'Pincode is required'],
            validate: {
                validator: function (v) {
                    return /^\d{6}$/.test(v);
                },
                message: 'Pincode must be a valid 6-digit number'
            }
        },
        phone: {
            type: String,
            required: [true, 'Phone number is required'],
            validate: {
                validator: function (v) {
                    return /^[6-9]\d{9}$/.test(v);
                },
                message: 'Phone must be a valid 10-digit Indian number'
            }
        }
    },
    paymentStatus: {
        type: String,
        enum: {
            values: ['pending', 'completed', 'failed'],
            message: 'Payment status must be pending, completed, or failed'
        },
        default: 'pending'
    },
    paymentId: {
        type: String,
        trim: true,
        maxLength: [100, 'Payment ID cannot exceed 100 characters']
    },
    razorpayOrderId: {
        type: String,
        trim: true,
        maxLength: [100, 'Razorpay Order ID cannot exceed 100 characters']
    },
    orderStatus: {
        type: String,
        enum: {
            values: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
            message: 'Invalid order status'
        },
        default: 'pending'
    },
    orderDate: {
        type: Date,
        default: Date.now
    },
    deliveryDate: {
        type: Date,
        validate: {
            validator: function (v) {
                if (!v) return true;
                return v > this.orderDate;
            },
            message: 'Delivery date must be after order date'
        }
    }
}, { timestamps: true });

orderSchema.index({ user: 1, orderDate: -1 });
orderSchema.index({ orderStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
