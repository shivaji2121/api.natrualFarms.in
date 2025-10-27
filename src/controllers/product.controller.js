const productModel = require('../models/product.model');
const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator');


module.exports.createProduct = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { name, description, category, price, unit, stock, isOrganic, farmSource } = req.body;
        console.log('req.body: ', JSON.parse(JSON.stringify(req.body)));

        const file = req.file;

        if (!file) {
            return res.status(400).json({ success: false, message: 'Image file is required' });
        }

        const permanentDir = './uploads/products';
        if (!fs.existsSync(permanentDir)) {
            fs.mkdirSync(permanentDir, { recursive: true });
        }

        const permanentPath = path.join(permanentDir, file.filename);
        await fs.promises.rename(file.path, permanentPath);

        const imageUrl = `${req.protocol}://${req.get('host')}/uploads/products/${file.filename}`;

        // Or use relative path if you prefer
        // const imageUrl = `/uploads/products/${file.filename}`;

        console.log('Image uploaded:', {
            filename: file.filename,
            size: file.size,
            mimetype: file.mimetype,
            url: imageUrl
        });

        const product = await productModel.create({
            name,
            description,
            category,
            price,
            unit,
            stock,
            image: imageUrl,
            isOrganic,
            farmSource,
            createdBy: req.user._id
        });
        console.log('product: ', product);

        await product.populate('createdBy', 'name email');

        res.status(201).json({ success: true, message: 'Product created successfully', data: product });
    } catch (error) {
        console.error('Product creation error:', error);
        res.status(500).json({ success: false, message: 'Failed to create product', error: error.message });
    }
};