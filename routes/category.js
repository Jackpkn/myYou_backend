const express = require("express");

const categoryM = require("../models/category_model");
const categoryRoute = express.Router();
// create category

const admin = require("../middlewares/admin");
const auth = require("../middlewares/auth_middlewares");
categoryRoute.post("/category/add-product", async (req, res) => {
  try {
    const { types, image, categoryName, strPrice } = req.body;

    // if (exist) {
    //   return res.status(400).json({ msg: "This product already exist" });
    // }
    const category = new categoryM({
      types,
      image,
      categoryName,
      strPrice,
    });
    const model = await category.save();
    res.status(200).json(model);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

categoryRoute.get("/category/get-all-product", async (req, res) => {
  try {
    const category = await categoryM.find({ types: req.query.types });
    res.status(200).json(category);
    // console.log(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
);
categoryRoute.delete("/category/delete-product", async (req, res) => {
  try {
    const { id } = req.body;
    const category = await categoryM.findByIdAndDelete(id);
    // await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
);


categoryRoute.put("/category/update-product/:id", admin, async (req, res) => {
  try {
    const { id } = req.params;
    const category = new categoryM.findByIdAndUpdate(
      id,

      req.body,
      {
        new: true,
      }
    );
    res.json({ msg: "Product updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = categoryRoute;
