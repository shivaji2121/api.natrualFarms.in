const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minLength: [2, 'Name must be at least 2 characters long'],
        maxLength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
            },
            message: 'Please enter a valid email address'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false,

    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        validate: {
            validator: function (v) {
                return /^[6-9]\d{9}$/.test(v);
            },
            message: 'Please enter a valid 10-digit Indian phone number'
        }
    },
    profileImage: {
        type: String,
        default: '',
        validate: {
            validator: function (v) {
                if (!v) return true;
                return /^https?:\/\/.+/.test(v);
            },
            message: 'Profile image must be a valid URL'
        }
    },
    address: {
        street: {
            type: String,
            trim: true,
            maxLength: [200, 'Street address cannot exceed 200 characters']
        },
        city: {
            type: String,
            trim: true,
            maxLength: [50, 'City name cannot exceed 50 characters']
        },
        state: {
            type: String,
            trim: true,
            maxLength: [50, 'State name cannot exceed 50 characters']
        },
        pincode: {
            type: String,
            validate: {
                validator: function (v) {
                    if (!v) return true;
                    return /^\d{6}$/.test(v);
                },
                message: 'Please enter a valid 6-digit pincode'
            }
        }
    },
    role: {
        type: String,
        enum: {
            values: ['customer', 'admin'],
            message: 'Role must be either customer or admin'
        },
        default: 'customer'
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

userSchema.statics.hashPassword = async function (password) {
    return await bcrypt.hash(password, 12);
};

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function () {
    return jwt.sign(
        { userId: this._id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

module.exports = mongoose.model('User', userSchema);
