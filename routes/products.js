const express = require("express");
const auth = require("../middlewares/auth_middlewares");
const productRouter = express.Router();
const { Product } = require("../models/product_model");

//? get product by query
productRouter.get("/api/get-products", auth, async (req, res) => {
  try {
    const products = await Product.find({ category: req.query.category });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
productRouter.get("/api/filer", async (req, res) => {
  try {
    const queryObject = { ...req.query };
    const excludedField = ["page", "sort", "limit", "fields"];
    excludedField.forEach((el) => delete queryObject(el));
    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g);
    let query = Product.find(JSON.parse(queryStr));
    if (req.query.sort) {
      let sortFix = req.query.sort.split(",").join(" ");
      query = query.sort(sortFix);
    } else {
      query = query.sort("-createdAt ");
    }
    // limiting the fields (selected field will be show)
    if (req.query.fields) {
      const fields = req.query.fields.split(",").join(" ");
    } else {
      query = query.select("-__v");
    }
    // pagination
    const page = req.query.page;
    const limit = req.query.limit | 10; //default per page 10
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    const products = await query;

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
 
// find by search
productRouter.get("/api/search", async (req, res) => {
  try {
    const { category, price, sort } = req.query;
    const queryObject = {};
    let product = Product.find(queryObject);
    if (category) {
      queryObject.category = { $regex: category, $options: "i" };
    }
    if (price) {
      queryObject.price = price;
    }
    if (sort) {
      let sortFix = sort.replace(",", " ");
      product = product.sort(sortFix);
    }
    const data = await product;
    console.log(queryObject);

    res.json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

productRouter.post("/api/rate-product", auth, async (req, res) => {
  try {
    const { id, rating, message } = req.body;
    let product = await Product.findById(id);

    for (let i = 0; i < product.ratings.length; i++) {
      if (product.ratings[i].userId == req.user) {
        product.ratings.splice(i, 1);
        break;
      }
    }
    const ratingSchema = {
      userId: req.user,
      rating,
      message,
    };
    product.ratings.push(ratingSchema);
    product = await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = productRouter;
