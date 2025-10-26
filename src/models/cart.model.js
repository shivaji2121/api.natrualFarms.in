const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product reference is required']
    },
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [1, 'Quantity must be at least 1'],
        max: [100, 'Quantity cannot exceed 100'],
        default: 1,
        validate: {
            validator: Number.isInteger,
            message: 'Quantity must be a whole number'
        }
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative'],
        validate: {
            validator: function (v) {
                return Number.isFinite(v) && v >= 0;
            },
            message: 'Price must be a valid positive number'
        }
    }
});

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required'],
        unique: true
    },
    items: {
        type: [cartItemSchema],
        validate: {
            validator: function (v) {
                return v.length <= 50;
            },
            message: 'Cart cannot have more than 50 items'
        }
    },
    totalAmount: {
        type: Number,
        default: 0,
        min: [0, 'Total amount cannot be negative']
    }
}, { timestamps: true });

cartSchema.pre('save', function (next) {
    this.totalAmount = this.items.reduce((total, item) => {
        return total + (item.price * item.quantity);
    }, 0);
    next();
});

cartSchema.pre('save', function (next) {
    const productIds = this.items.map(item => item.product.toString());
    const uniqueIds = new Set(productIds);
    if (productIds.length !== uniqueIds.size) {
        return next(new Error('Cart cannot contain duplicate products'));
    }
    next();
});

module.exports = mongoose.model('Cart', cartSchema);