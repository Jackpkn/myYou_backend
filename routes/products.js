const express = require('express');
const auth = require('../middlewares/auth_middlewares');
const productRouter = express.Router()
const { Product}  = require('../models/product_model');
productRouter.get("/api/products",auth, async (req, res) => {
    try {
        const products = await Product.find({ category: req.query.category });
        console.log(products)
        
        res.json(products);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
productRouter.post("/auth/rate-product", auth, async (req, res) => {
    try {
        const { id, rating } = req.body;
        let product = await Product.findById(id);
        
        for (let i = 0; i < product.ratings.length; i++){
            if (product.ratings[i].userId == req.user) {
                product.ratings.splice(i, 1);
                break;
            }
        }
        const ratingSchema = {
            userId: req.user,
            rating,
        };
        product.ratings.push(ratingSchema);
        product = await product.save();
        res.json(product);
    } catch (error
    ) {
        res.status(500).json({ error: error.message });  
    }
})

module.exports = productRouter;
