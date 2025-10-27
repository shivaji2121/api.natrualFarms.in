const productModel = require('../models/product.model');

module.exports.getRecords = async (filter, sort, skip, pageSize) => {
    const productRecords = await productModel
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(pageSize)
        .populate('createdBy', 'name email')
        .lean();

    const totalRecords = await productModel.countDocuments(filter);

    return { productRecords, totalRecords };
};
