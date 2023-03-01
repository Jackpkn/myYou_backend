const express = require("express");
const adminRouter = express.Router();
const adminModel = require("../models/admin_models");
const admin = require('../middlewares/admin');
adminRouter.post("/admin/Product", admin, async (req, res) => {
  const { price, description, frontImage, productDetails, images } = req.body;
  // first you to check the this is admin or not
  let product = new adminModel({
    price,
    description,
    frontImage,
    productDetails,
    images,
  });

  product = await product.save();
  res.json(product);
});

module.exports = adminRouter;
