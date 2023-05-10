const express = require('express');
const Order = require('../models/order_model')
const auth = require('../auth_middlewares/');
const User = require('../models/user_auth_model');

const orderRouter = express.Router();
orderRouter.delete('/api/delete-order/:id', auth, async (req, res) => {

    try {

        const user = await User.findById(req.user);
        if (!user) {
            res.status(404).json({ msg: 'User not found' });
        }
        const { id } = req.params;// check the product exist in database or not 
        const order = await Order.findByIdAndDelete({ userId: id });
        res.status(200).json(order);

    } catch (error) {
        res.status(500).json(error);
    }
})
// fetch previous order 
module.exports = orderRouter;