const express = require("express");
const userRouter = express.Router();
const auth = require("../middlewares/auth_middlewares");
const { Product } = require("../models/product_model");
const User = require("../models/user_auth_model");
const Order = require("../models/order_model");
const { favourite } = require("../models/favourites");

userRouter.post("/api/add-to-cart", auth, async (req, res) => {
  try {
    const { id } = req.body;
    const product = await Product.findById(id);
    let user = await User.findById(req.user);

    if (user.cart.length == 0) {
      user.cart.push({ product, quantity: 1 });
    } else {
      let isProductFound = false;
      for (let i = 0; i < user.cart.length; i++) {
        if (user.cart[i].product._id.equals(product._id)) {
          isProductFound = true;
        }
      }

      if (isProductFound) {
        let producttt = user.cart.find((productt) =>
          productt.product._id.equals(product._id)
        );
        producttt.quantity += 1;

        // productt.delete()
      } else {
        user.cart.push({ product, quantity: 1 });
      }
    }
    user = await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//              ??????????????????????????????????????????????????!
//              ???????????????????????????????????????????????????
userRouter.delete("/api/remove-from-cart/:id", auth, async (req, res) => {
  try {
    // req.query
    const { id } = req.params;
    const product = await Product.findById(id);
    let user = await User.findById(req.user);

    for (let i = 0; i < user.cart.length; i++) {
      if (user.cart[i].product._id.equals(product._id)) {
        if (user.cart[i].quantity == 1) {
          user.cart.splice(i, 1);
        } else {
          user.cart[i].quantity -= 1;
        }
      }
    }
    user = await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//              ??????????????????????????????????????????????????!
//              ???????????????????????????????????????????????????
userRouter.delete("/api/delete-cart/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    let user = await User.findById(req.user);
    for (let i = 0; i < user.cart.length; i++) {
      if (user.cart[i].product._id.equals(product._id)) {
        user.cart[i].remove();
      }
    }

    res.status(200).json({ msg: "product successfully deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//! fetch user order
userRouter.post("/api/user-order", auth, async (req, res) => {
  try {
    const { cart, totalPrice, address } = req.body;
    let products = [];
    for (let i = 0; cart.length; i++) {
      let product = await Product.findById(cart[i].product._id);
      if (product.quantity >= cart[i].quantity) {
        product.quantity -= cart[i].quantity;
        products.push({ product, quantity: cart[i].quantity });
        await products.save();
      } else {
        return res.status(400).json({ msg: `${product.name} is out of stock` });
      }
    }
    let user = await User.findById(req.user);
    user.cart = [];
    user = await user.save();
    let order = new Order({
      products,
      totalPrice,
      address,
      userId: req.user,
      orderedAt: new Date().getTime(),
    });
    order = await order.save();
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
//              ??????????????????????????????????????????????????!
//              ???????????????????????????????????????????????????
userRouter.get("/api/get-user-order", auth, async (req, res) => {
  try {
    const order = Order.findById({ userId: req.user });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
userRouter.put("/api/favourite/:id", auth, async (req, res) => {
  try {
    const itemId = req.params.id;
    let user = await User.findById(req.user);
    const existingFavourite = await favourite.findOne({ user, itemId });
    if (existingFavourite) {
      await favourite.deleteOne({ user, itemId });
      // res.json({msg: ""})
    } else {
      await favourite.insertOne({ user, itemId });
    }
    res.json({ msg: "ok" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
userRouter.get("/api/get-all-favourite", auth, async (req, res) => {
  try {
    const fav = favourite.findById({ userId: req.user });
    res.status(200).json(fav);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// add to wishList
userRouter.put("/api/addToWishList", auth, async (req, res) => {
 
 

  try {
   
    const { id } = req.body;
    const product = await Product.findById(id);
    // console.log(product)
    let user = await User.findById(req.user);
    
    const alreadyAdded = user.wishlist.find(
      (ids) => ids.toString() === id
    );
    //  console.log(alreadyAdded)
    if (alreadyAdded) {
      let user = await User.findByIdAndUpdate(
        req.user,
        {
          $pull: { wishlist: id },
        },
        { new: true }
      );
      res.json(user);
      console.log(user);
    } else {
      let user = await User.findByIdAndUpdate(
        req.user,
        {
          $push: { wishlist: id },
        },
        { new: true }
      );
      res.json(user);
      console.log(user);
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
});
userRouter.get("/api/getWishProduct", auth, async (req, res) => {
  
  try {
    const wishProduct = await User.findById(req.user).populate("wishlist");
    res.json(wishProduct);
    console.log(wishProduct)
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

userRouter.put("/api/rating", auth, async (req, res) => {
  try {
    const { id } = req.user; // give the id of signed in user
    const { star, productId, message } = req.body;
    const product = await Product.findById(productId);
    const alreadyRated = product.ratings.find(
      (userId) => userId.postedBy.toString() === id.toString()
    );
    if (alreadyRated) {
      const updateRating = await Product.updateOne(
        {
          ratings: { $elemMatch: alreadyRated },
        },
        {
          $set: { "ratings.$.star": star, "ratings.$.message": message },
        },
        {
          new: true,
        }
      );
      res.json(updateRating);
    } else {
      const rateProduct = await Product.findByIdAndUpdate(
        productId,
        {
          $push: {
            ratings: {
              star: star,
              postedBy: id,
              message: message,
            },
          },
        },
        { new: true }
      );
      res.json(rateProduct);
    }
    const getAllRating = await Product.findById(productId);
    let totalRating = getAllRating.ratings.length;
    let ratingSum = getAllRating.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);
    let actualRating = Math.round(ratingSum / totalRating);
    let finalProduct = await Product.findByIdAndUpdate(
      productId,
      { totalRating: actualRating },
      { new: true }
    );
    res.json(finalProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = userRouter;
