const Order = require('../models/order.model');

module.exports.getRecords = async (filter, sort, skip, pageSize) => {
    const orderRecords = await Order.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(pageSize).
        select('-shippingAddress')
        .populate('user', 'name email phoneNumber')
        .populate('items.product', 'name price')


    const totalRecords = await Order.countDocuments(filter);

    return { orderRecords, totalRecords };
};