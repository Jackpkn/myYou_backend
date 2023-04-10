const express = require("express");
const auth = require("../middlewares/auth_middlewares");
const productRouter = express.Router();
const { Product } = require("../models/product_model");
const { match } = require("assert");
class ApiService {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }
  filtering() {
    const queryObj = { ...this.queryString };
    let excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    this.query.find(JSON.parse(queryStr));
    return this;
  }
}
//? get product by query
productRouter.get("/api/get-products", async (req, res) => {
  try {
    const products = await Product.find({ category: req.query.category });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
productRouter.get("/api/filer", async (req, res) => {
  try {
    const { category } = req.query;
    const queryObject = { ...req.query };
    // const excludedField = ["page", "sort", "limit", "fields"];
    // excludedField.forEach((el) => delete queryObject(el));
    let queryStr = JSON.stringify(queryObject);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g);
    let query = Product.find(JSON.parse(queryStr));

    if (RegExp(req.query.sort, "i")) {
      let sortFix = req.query.sort.split(",").join(" ");
      query = query.sort(sortFix);
    } else {
      query = query.sort("-createdAt ");
    }
    // limiting the fields (selected field will be show)
    if (RegExp(req.query.fields, "i")) {
      const fields = req.query.fields.split(",").join(" ");
    } else {
      query = query.select("-__v");
    }

    //
    // pagination
    const page = req.query.page;
    const limit = req.query.limit | 10; //default per page 10
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    const products = await RegExp(query, "i");

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// find by search
productRouter.get("/api/search", async (req, res) => {
  try {
    const { category, price, sort } = req.query;
    let queryObject = {};
    // const products = new ApiService(Product.find(), req.query).filtering();
    
     
    // let prices= parseInt(product.price);

    if (category) {
      queryObject.category = { $regex: category, $options: "i" };
      //  category = category
    }
    if (price) {
      queryObject.price = price;
    }
   
    let product = await Product.find(queryObject);
    if (sort) {
      // let sortFix = req.query.sort.split(",").join(" ");
      // let sortFix = sort.replace(",").join(" ");
      product = product.sort();
    }
    console.log(product);

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

productRouter.post("/api/rate-product", auth, async (req, res) => {
  try {
    const { id, star, message } = req.body;
    let product = await Product.findById(id);

    for (let i = 0; i < product.ratings.length; i++) {
      if (product.ratings[i].userId == req.user) {
        product.ratings.splice(i, 1);
        break;
      }
    }
    const ratingSchema = {
      userId: req.user,
      star,
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
