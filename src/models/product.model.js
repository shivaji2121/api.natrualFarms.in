const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        minLength: [3, 'Product name must be at least 3 characters long'],
        maxLength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        minLength: [10, 'Description must be at least 10 characters long'],
        maxLength: [1000, 'Description cannot exceed 1000 characters']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: {
            values: ['milk', 'ghee', 'paneer', 'curd', 'butter', 'cheese', 'honey', 'other'],
            message: 'Category must be one of: milk, ghee, paneer, curd, butter, cheese, honey, other'
        }
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative'],
        max: [100000, 'Price cannot exceed 100000'],
        validate: {
            validator: function (v) {
                return Number.isFinite(v) && v >= 0;
            },
            message: 'Price must be a valid positive number'
        }
    },
    unit: {
        type: String,
        default: 'liter',
        enum: {
            values: ['liter', 'kg', 'gram', 'ml', 'piece', 'packet'],
            message: 'Unit must be one of: liter, kg, gram, ml, piece, packet'
        }
    },
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: [0, 'Stock cannot be negative'],
        default: 0,
        validate: {
            validator: Number.isInteger,
            message: 'Stock must be a whole number'
        }
    },
    image: {
        type: String,
        default: "",
    },
    isOrganic: {
        type: Boolean,
        default: true
    },
    farmSource: {
        type: String,
        default: '',
        maxLength: [200, 'Farm source description cannot exceed 200 characters']
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Product creator is required']
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

productSchema.index({ name: 'text', description: 'text' });

productSchema.index({ category: 1, price: 1 });

productSchema.index({ deletedAt: 1 });

productSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Product', productSchema);