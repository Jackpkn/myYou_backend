const express = require("express");
const adminRouter = express.Router();
const adminModel = require("../models/admin_models");
const admin = require("../middlewares/admin");
adminRouter.post("/admin/add-product", admin, async (req, res) => {
  try {
    const { name, description, images, quantity, price, category } = req.body;

    // first you to check the this is admin or not
    let product = new adminModel({
      name,
      description,
      images,
      quantity,
      price,
      category,
    });

    product = await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

adminRouter.get("/admin/get-product", async (req, res) => {
  try {
    const products = new adminModel.find({});
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
adminRouter.delete("/admin/delete-product", async (req, res) => {
  try {
    const { id } = req.body;
    const deleteProduct = new adminModel.findByIdAndDelete(id);
    res.json(deleteProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = adminRouter;
