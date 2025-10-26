const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model')

const isAuthorized = async (req, res, next) => {
    try {
        const token = req.cookies?.token || (req.headers.authorization && req.headers.authorization?.split(' ')[1]);

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized - Token not provided' });
        }

        const userData = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findOne({ _id: userData.userId, deletedAt: null })

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        req.user = user;

        return next();
    } catch (error) {
        console.error('Auth error:', error.message);
        return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }
}


const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'Access denied'
        });
    }
};

module.exports = { isAuthorized, isAdmin };