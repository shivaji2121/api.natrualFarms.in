const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const connectToDb = require('./src/config/dbConfiguration');
const cookieParser = require('cookie-parser');
const userRouter = require('./src/routes/user.routes');
const productRouter = require('./src/routes/product.routes');
const cartRouter = require('./src/routes/cart.routes');
const orderRouter = require('./src/routes/order.routes');
const errorHandler = require('./src/utils/errorHandler');
const path = require('path');
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.get('/', (req, res) => {
    res.send('Hello World!')
})


app.use('/user', userRouter);
app.use('/product', productRouter);
app.use('/cart', cartRouter);
app.use('/order', orderRouter);


app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`server is running at http://localhost:${PORT}`);
    connectToDb();
});