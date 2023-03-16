const express = require("express");
const adminRouter = express.Router();
const { Product } = require("../models/product_model");
const admin = require("../middlewares/admin");
adminRouter.post("/admin/add-product", admin, async (req, res) => {
  try {
    const { name, description, images, quantity, price, category } = req.body;

    // first you to check the this is admin or not
    let product = new Product({
      name,
      description,
      images,
      quantity,
      price,
      category,
    });

    products = await product.save();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.get("/admin/get-product", async (req, res) => {
  try {
    const products = new Product.find({});
    // how to get all product
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
adminRouter.delete("/admin/delete-product", async (req, res) => {
  try {
    const { id } = req.body;
    const deleteProduct = new Product.findByIdAndDelete(id);
    res.json(deleteProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = adminRouter;
// status =>
