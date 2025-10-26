const express = require('express');
const router = express.Router();
const userValidation = require('../validations/auth.validator')
const userController = require('../controllers/auth.controller')
const userMiddleware = require('../middlewares/auth.middleware');


router.post('/register', userValidation.signupValidation, userController.registerUser);
router.post('/login', userValidation.loginValidation, userController.loginUser);
router.get('/profile', userMiddleware.isAuthorized, userController.getUserProfile);
router.put('/update', userMiddleware.isAuthorized, userValidation.profileUpdateValidation, userController.updateProfileById);
router.patch('/update-password', userMiddleware.isAuthorized, userValidation.passwordValidation, userController.updateUserPassword);
router.get('/customers', userMiddleware.isAuthorized, userMiddleware.isAdmin, userController.getAllUsers)
router.delete('/:id/remove', userMiddleware.isAuthorized, userMiddleware.isAdmin, userController.softDeleteUser);
router.get('/:id', userMiddleware.isAuthorized, userController.getUserById);

module.exports = router;