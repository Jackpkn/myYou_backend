const mongoose = require("mongoose");
const adminModel = new mongoose.Schema({
   
    price: {
        type: Number,
        required: true,

    },
    description: {
        type: String,
        required: true
    },
    frontImage: {
        type: String,
        required: true,

    },
    productDetails: {
        type: String,
    },
    images: []





})
module.exports = adminModel;