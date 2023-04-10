const mongoose = require("mongoose");

const categoryModel = mongoose.Schema({
  types: {
    // appliances or furniture
    type: String,
    required: true,
    enum: ["Appliances", "Furniture"]
  },
  image: [
    {
      type: String,
      required: true,
    },
  ],
  categoryName: {
    type: String,
    required: true,
  },
  strPrice: {
    type: Number,
    required: true,
  },
});

const categoryM = mongoose.model("categoryModel", categoryModel);
module.exports = categoryM;
