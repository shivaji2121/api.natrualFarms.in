module.exports.createProduct = async (req, res, next) => {
    try {


    } catch (error) {
        console.error('error: ', error);
        return res.status(500).json({ message: "Internal server error" })
    }
}