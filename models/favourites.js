 const  mongoose = require("mongoose");
 const {adminModel} =require('./product_model');
 const favourites = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    itemId:{
        type: String,
        required: true,
    },
    product: [
          adminModel
    ]
 })
 const favourite = mongoose.model('favourite', favourites);
 module.exports = {favourite, favourites};