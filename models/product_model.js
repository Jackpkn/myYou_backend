const mongoose = require("mongoose");
const ratingSchema = require("./ratings");
const adminModel = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String,
      required: true,
    },
  ],
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    
  },
  like: {
    type: Number,
    default: 0,
  },
  disLike: {
    type: Number,
    default: 0,
  },
  ratings: [ratingSchema],
  totalRating: {
    type: String,
    default: 0,
  },
  //! specification
});
const Product = mongoose.model("Product", adminModel);
module.exports = { Product, adminModel };
 
