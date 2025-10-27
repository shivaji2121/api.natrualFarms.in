const cartModel = require('../models/cart.model');
const productModel = require('../models/product.model');
const { validationResult } = require('express-validator');

module.exports.addToCart = async (req, res, next) => {
    try {
        // 1. Validate request errors
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        // 2. Get user ID and request body
        const userId = req.user._id;
        const { productId, quantity = 1 } = req.body;

        // 3. Check if product exists and is not deleted
        const product = await productModel.findOne({ _id: productId, deletedAt: null });

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found or unavailable' });
        }

        // 4. Check stock availability
        if (product.stock < quantity) {
            return res.status(400).json({ success: false, message: `Only ${product.stock} items available in stock` });
        }

        // 5. Find user's cart
        let cart = await cartModel.findOne({ user: userId });

        if (!cart) {
            // Create new cart if doesn't exist
            cart = new cartModel({ // Fixed: Changed 'Cart' to 'cartModel'
                user: userId,
                items: [{
                    product: productId,
                    quantity: quantity,
                    price: product.price
                }]
            });
        } else {
            // Check if product already exists in cart
            const itemIndex = cart.items.findIndex(
                item => item.product.toString() === productId
            );

            if (itemIndex > -1) {
                // Product exists - update quantity
                const newQuantity = cart.items[itemIndex].quantity + quantity;

                // Validate against stock
                if (newQuantity > product.stock) {
                    return res.status(400).json({
                        success: false,
                        message: `Cannot add more. Only ${product.stock} items available`
                    });
                }

                // Validate max limit (100 units per product)
                if (newQuantity > 100) {
                    return res.status(400).json({
                        success: false, // Fixed: Added comma after false
                        message: 'Maximum 100 units per product allowed'
                    });
                }

                // Update existing item
                cart.items[itemIndex].quantity = newQuantity;
                cart.items[itemIndex].price = product.price;
            } else {
                // Add new product to cart
                cart.items.push({
                    product: productId,
                    quantity: quantity,
                    price: product.price
                });
            }
        }

        // 6. Save cart (totalAmount will be calculated by pre-save hook)
        await cart.save();

        // 7. Populate product details for response
        await cart.populate({
            path: 'items.product',
            select: 'name description category price unit stock image isOrganic'
        });

        return res.status(200).json({ success: true, message: 'Product added to cart successfully', data: cart });

    } catch (error) {
        console.error('Add to cart error:', error);
        return res.status(500).json({ success: false, message: 'Failed to add product to cart' });
    }
};

module.exports.removeFromCart = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { productId } = req.params;

        const cart = await cartModel.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        const initialLength = cart.items.length;

        cart.items = cart.items.filter(item => item.product.toString() !== productId);

        if (cart.items.length === initialLength) {
            return res.status(404).json({ success: false, message: 'Product not found in cart' });
        }

        await cart.save();

        await cart.populate({
            path: 'items.product',
            select: 'name description category price unit stock image isOrganic'
        });

        return res.status(200).json({ success: true, message: 'Product removed from cart', data: cart });

    } catch (error) {
        console.error('Remove from cart error:', error);
        return res.status(500).json({ success: false, message: 'Failed to remove product from cart' });
    }
};


module.exports.getCart = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const cart = await cartModel.findOne({ user: userId }).populate({
            path: 'items.product',
            select: 'name description category price unit stock image isOrganic'
        });

        if (!cart) {
            return res.status(200).json({
                success: true,
                message: 'Cart is empty',
                data: {
                    user: userId,
                    items: [],
                    totalAmount: 0
                }
            });
        }

        const originalLength = cart.items.length;
        cart.items = cart.items.filter(item => item.product !== null);

        if (cart.items.length !== originalLength) {
            await cart.save();
        }

        return res.status(200).json({
            success: true,
            message: 'Cart retrieved successfully',
            data: cart
        });

    } catch (error) {
        console.error('Get cart error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to retrieve cart'
        });
    }
};


// 3. GET CART COUNT (For Badge)

module.exports.getCartCount = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const cart = await cartModel.findOne({ user: userId });

        if (!cart) {
            return res.status(200).json({
                success: true,
                data: {
                    itemCount: 0,
                    totalQuantity: 0,
                    totalAmount: 0
                }
            });
        }

        const itemCount = cart.items.length;
        const totalQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);

        return res.status(200).json({
            success: true,
            data: {
                itemCount,
                totalQuantity,
                totalAmount: cart.totalAmount
            }
        });

    } catch (error) {
        console.error('Get cart count error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to get cart count'
        });
    }
};


// 4. UPDATE CART ITEM (Change Quantity)

module.exports.updateCartItem = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const userId = req.user._id;
        const { productId, quantity } = req.body;

        const cart = await cartModel.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Product not found in cart'
            });
        }

        const product = await productModel.findOne({
            _id: productId,
            deletedAt: null
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product no longer available'
            });
        }

        if (quantity > product.stock) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} items available`
            });
        }

        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].price = product.price;

        await cart.save();

        await cart.populate({
            path: 'items.product',
            select: 'name description category price unit stock image isOrganic'
        });

        return res.status(200).json({
            success: true,
            message: 'Cart updated successfully',
            data: cart
        });

    } catch (error) {
        console.error('Update cart error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update cart'
        });
    }
};


// 6. CLEAR CART (Empty Cart)

module.exports.clearCart = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const cart = await cartModel.findOne({ user: userId });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        cart.items = [];
        await cart.save();

        return res.status(200).json({
            success: true,
            message: 'Cart cleared successfully',
            data: cart
        });

    } catch (error) {
        console.error('Clear cart error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to clear cart'
        });
    }
};


// 7. VALIDATE CART (Check Before Checkout)

module.exports.validateCart = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const cart = await cartModel.findOne({ user: userId }).populate({
            path: 'items.product',
            select: 'name price stock deletedAt'
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        const issues = [];

        for (const item of cart.items) {
            // Check if product exists
            if (!item.product || item.product.deletedAt) {
                issues.push({
                    product: item.product?.name || 'Unknown',
                    issue: 'Product no longer available',
                    severity: 'error'
                });
                continue;
            }

            // Check stock
            if (item.product.stock < item.quantity) {
                issues.push({
                    product: item.product.name,
                    issue: `Only ${item.product.stock} items available, you have ${item.quantity} in cart`,
                    severity: 'error'
                });
                continue;
            }

            // Check price changes
            if (item.price !== item.product.price) {
                issues.push({
                    product: item.product.name,
                    issue: `Price changed from ₹${item.price} to ₹${item.product.price}`,
                    severity: 'warning'
                });
            }
        }

        const isValid = issues.filter(i => i.severity === 'error').length === 0;

        return res.status(200).json({
            success: isValid,
            message: isValid ? 'Cart is valid' : 'Cart has validation issues',
            data: {
                isValid,
                issues,
                totalIssues: issues.length
            }
        });

    } catch (error) {
        console.error('Validate cart error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to validate cart'
        });
    }
};

// 8. SYNC CART PRICES (Update Prices)

module.exports.syncCartPrices = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const cart = await cartModel.findOne({ user: userId });

        if (!cart || cart.items.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Cart is empty'
            });
        }

        let updated = false;

        for (let item of cart.items) {
            const product = await productModel.findById(item.product);

            if (product && product.price !== item.price) {
                item.price = product.price;
                updated = true;
            }
        }

        if (updated) {
            await cart.save();
        }

        await cart.populate({
            path: 'items.product',
            select: 'name description category price unit stock image isOrganic'
        });

        return res.status(200).json({
            success: true,
            message: updated ? 'Cart prices synchronized' : 'Prices already up to date',
            data: cart
        });

    } catch (error) {
        console.error('Sync prices error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to sync prices'
        });
    }
};

// 9. MERGE CART (Merge Guest Cart)

module.exports.mergeCart = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const userId = req.user._id;
        const { guestCartItems } = req.body;

        if (!Array.isArray(guestCartItems) || guestCartItems.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Guest cart items required'
            });
        }

        let cart = await cartModel.findOne({ user: userId });

        if (!cart) {
            cart = new cartModel({
                user: userId,
                items: []
            });
        }

        for (const guestItem of guestCartItems) {
            const product = await productModel.findOne({
                _id: guestItem.productId,
                deletedAt: null
            });

            if (!product) continue;

            const existingIndex = cart.items.findIndex(
                item => item.product.toString() === guestItem.productId
            );

            if (existingIndex > -1) {
                // Merge quantities
                const newQty = cart.items[existingIndex].quantity + guestItem.quantity;
                cart.items[existingIndex].quantity = Math.min(newQty, product.stock, 100);
                cart.items[existingIndex].price = product.price;
            } else {
                // Add new item
                cart.items.push({
                    product: guestItem.productId,
                    quantity: Math.min(guestItem.quantity, product.stock, 100),
                    price: product.price
                });
            }
        }

        await cart.save();

        await cart.populate({
            path: 'items.product',
            select: 'name description category price unit stock image isOrganic'
        });

        return res.status(200).json({
            success: true,
            message: 'Carts merged successfully',
            data: cart
        });

    } catch (error) {
        console.error('Merge cart error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to merge carts'
        });
    }
};