const express = require("express");
const userRouter = express.Router();
const auth = require("../middlewares/auth_middlewares");
const { Product } = require("../models/product_model");
const User = require("../models/user_auth_model");
const Order = require("../models/order_model");
const { urlencoded } = require("body-parser");
const productRouter = require("./products");
// const { favourite } = require("../models/favourites");
// const { findByIdAndDelete } = require("../models/user_auth_model");

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

userRouter.delete("/api/delete/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ msg: "User Not found" });
    }

    const updatedCart = user.cart.filter(
      (item) => item.product._id.toString() !== id
    );
    user.cart = updatedCart;

    const afterDelete = await user.save();
    res.json(afterDelete);
    // console.log(j);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

//              ??????????????????????????????????????????????????!
//              ???????????????????????????????????????????????????

// add to wishList
userRouter.put("/api/addToWishList", auth, async (req, res) => {
  try {
    const { id } = req.body;
    // const product = await Product.findById(id);
    // console.log(product)
    let user = await User.findById(req.user);

    const alreadyAdded = user.wishlist.find((ids) => ids.toString() === id);
    //  console.log(alreadyAdded)
    if (alreadyAdded) {
      let user = await User.findByIdAndUpdate(
        // we can do one thing here we can push all
        req.user,

        { $pull: { wishlist: id } },
        // { $pull: { wishlist: { product: product } } },

        { new: true }
      );
      res.json(user);
      console.log(user);
    } else {
      let user = await User.findByIdAndUpdate(
        req.user,
        {
          $push: {
            wishlist: id,
          },
          // $pull: { wishlist: { product: product } }
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
    console.log(wishProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// userRouter.post('/wishlist', auth, async (req, res) => {
//   const { id } = req.body;
//   const user = await User.findById(req.user);
//   const product = await Product.findById(id);

//   if (!user) {
//     return res.status(404).json({ msg: "User not found" });

//   }
//   if (!product) {
//     return res.status(404).json({ message: 'Product not found' });
//   }
//   if (user.wishlist.length == 0) {
//     user.wishlist.push({ product });
//   }
//   else {
//     let isFound = false;
//     for (let i = 0; i < user.wishlist.length; i++) {
//       if (user.wishlist[i].product._id.equals(product._id)) {
//         isProductFound = true;
//       }

//     }
//     if (isFound) {
//       let producttt = user.cart.find((productt) =>
//         productt.product._id.equals(product._id)
//       );
//       producttt.pull(product)
//     } else {
//       user.wishlist.push(product);
//     }
//   }
//   // const alreadyAdded = user.wishlist.find((ids) => ids.toString() === id);
//   user = await user.save();
//   console.log(user);
//   res.status(200).json(user);
// })

userRouter.put("/api/rating", auth, async (req, res) => {
  try {
    // const { id } = req.user; // give the id of signed in user
    const { id, star, message } = req.body;
    const product = await Product.findById(id);
    // const alreadyRated = product.ratings.find(
    //   (userId) => userId.postedBy.toString() === req.user._id.toString()
    // );
    const alreadyRated = product.ratings.find(
      (userId) => userId.postedBy.toString() === req.user._id
    );
    if (alreadyRated) {
      const updateRating = await Product.findByIdAndUpdate(
        id,
        {
          ratings: { $elemMatch: alreadyRated },
        },
        {
          $set: {
            "ratings.$.star": star,
            "ratings.$.message": message,
            // "ratings.$.postedBy": req.user,
          },
      },
        {
          new: true,
        }
      );
      // res.json(updateRating);
    } else {
      const rateProduct = await Product.findByIdAndUpdate(
        id,
        {
          $push: {
            ratings: {
              star: star,
              postedBy: req.user,
              message: message,
            },
          },
        },
        { new: true }
      );
      // res.json(rateProduct);
    }
    const getAllRating = await Product.findById(id);
    let totalRating = getAllRating.ratings.length;
    let ratingSum = getAllRating.ratings
      .map((item) => item.star)
      .reduce((prev, curr) => prev + curr, 0);
    let actualRating = Math.round(ratingSum / totalRating);
    let finalProduct = await Product.findByIdAndUpdate(
      id,
      { totalRating: actualRating },
      { new: true }
    );
    res.json(finalProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

userRouter.post("/api/user-order", auth, async (req, res) => {
  try {
    const { cart, totalPrice, address } = req.body;
    let products = [];
    for (let i = 0; i < cart.length; i++) {
      let product = await Product.findById(cart[i].product._id);
      if (product.quantity >= cart[i].quantity) {
        product.quantity -= cart[i].quantity;
        products.push({ product, quantity: cart[i].quantity });
        await product.save();
      }
      else {
        return res
          .status(400)
          .json({ msg: `${product.name} is out of stock!` });
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
    res.json(order);;
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

userRouter.get("/api/get-user-order", auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user });
    console.log(orders);
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//? like the product
userRouter.put("/api/like/:id", auth, async (req, res) => {
  try {
    // const { id } = req.params.id;
    // const product =await Product.findById(id);
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { like: 1 },
      },
      {
        new: true,
      }
    );
    res.json(product);
    // console.log(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
userRouter.put("/api/disLike/:id", auth, async (req, res) => {
  try {
    // const { id } = req.params.id;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        $inc: { disLike: 1 },
      },
      { new: true }
    );

    // console.log(product);
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
userRouter.get('/api/get-reviews', auth, async (req, res) => {

  try {
    const { id } = req.body;
    const product = await Product.findById(id);

    const alreadyRated = product.ratings.find(
      (userId) => userId.postedBy.toString() === req.user._id
    );
    res.status(200).json(alreadyRated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
})

module.exports = userRouter;

