const productModel = require('../models/product.model');
const fs = require('fs');
const path = require('path');
const paginationService = require('../utils/paginationHelper');
const productService = require('../services/product.service');
const { validationResult } = require('express-validator');


module.exports.createProduct = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { name, description, category, price, unit, stock, isOrganic, farmSource } = req.body;

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
        // const imageUrl = `/uploads/products/${file.filename}`

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

        await product.populate('createdBy', 'name email');

        res.status(201).json({ success: true, message: 'Product created successfully', data: product });
    } catch (error) {
        console.error('Product creation error:', error);
        res.status(500).json({ success: false, message: 'Failed to create product', error: error.message });
    }
};

module.exports.getAllProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.page_size) || 10;
        const search = req.query.search || '';

        // Sorting (default: newest first)
        // Accepts: 'name', '-name', 'price', '-price', 'createdAt', '-createdAt', 'stock', '-stock'
        const sort = req.query.sort || '-createdAt';

        const category = req.query.category;
        const minPrice = req.query.min_price;
        const maxPrice = req.query.max_price;
        const minStock = req.query.min_stock;
        const maxStock = req.query.max_stock;
        const isOrganic = req.query.is_organic;
        const unit = req.query.unit;
        const inStock = req.query.in_stock;

        const filter = { deletedAt: null };

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
                { farmSource: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) {
            filter.category = category;
        }

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }

        if (minStock || maxStock) {
            filter.stock = {};
            if (minStock) filter.stock.$gte = parseInt(minStock);
            if (maxStock) filter.stock.$lte = parseInt(maxStock);
        }

        if (inStock === 'true') {
            filter.stock = { $gt: 0 };
        } else if (inStock === 'false') {
            filter.stock = 0;
        }

        if (isOrganic !== undefined) {
            filter.isOrganic = isOrganic === 'true';
        }

        if (unit) {
            filter.unit = unit;
        }

        const skip = (page - 1) * pageSize;

        const { productRecords, totalRecords } = await productService.getRecords(filter, sort, skip, pageSize);

        const paginationInfo = await paginationService.getPaginationData(page, pageSize, totalRecords);

        return res.status(200).json({ success: true, message: "Products fetched successfully", data: { paginationInfo, products: productRecords } });
    } catch (error) {
        console.error('Error in getAllProducts:', error);
        return res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};