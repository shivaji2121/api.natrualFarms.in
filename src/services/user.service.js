const userModel = require('../models/user.model');

const getRecords = async (filter, sort, skip, pageSize) => {
    const userRecords = await userModel.find(filter).sort(sort).skip(skip).limit(pageSize);

    const totalRecords = await userModel.countDocuments(filter);

    return { userRecords, totalRecords }
};

module.exports = {
    getRecords
};
