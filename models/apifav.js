// Please make sure to install `express`, `mongoose`, `body-parser`, and `cors` packages before implementing the following code. 

// ```
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const { Product } = require('./product_model');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// connect to mongodb
mongoose.connect('mongodb://localhost/favourites_api', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// create favourite schema
const favouriteSchema = new mongoose.Schema({
  title: String,
  url: String,
  description: String,
  rating: Number,
  date: {
    type: Date,
    default: Date.now
  }
});

// create favourite model
const Favourite = mongoose.model('Favourite', favouriteSchema);

// create api routes
app.get('/', (req, res) => {
  res.send('Favourites API is running')
});

// get all favourites
app.get('/favourites', async (req, res) => {
  try {
    const favourites = await Favourite.find();
    res.json(favourites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// add new favourite
app.post('/favourites', async (req, res) => {
  const favourite = new Favourite({
    title: req.body.title,
    url: req.body.url,
    description: req.body.description,
    rating: req.body.rating
  });
  try {
    const newFavourite = await favourite.save();
    res.status(201).json(newFavourite);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// get single favourite
app.get('/favourites/:id', getFavourite, (req, res) => {
  res.json(res.favourite);
});

// update favourite
app.patch('/favourites/:id', getFavourite, async (req, res) => {
  if (req.body.title != null) {
    res.favourite.title = req.body.title;
  }
  if (req.body.url != null) {
    res.favourite.url = req.body.url;
  }
  if (req.body.description != null) {
    res.favourite.description = req.body.description;
  }
  if (req.body.rating != null) {
    res.favourite.rating = req.body.rating;
  }
  try {
    const updatedFavourite = await res.favourite.save();
    res.json(updatedFavourite);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// delete favourite
app.delete('/favourites/:id', getFavourite, async (req, res) => {
  try {
    await res.favourite.remove();
    res.json({ message: 'Favourite removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// middleware function to get favourite by id
async function getFavourite(req, res, next) {
  let favourite;
  try {
    favourite = await Favourite.findById(req.params.id);
    if (favourite == null) {
      return res.status(404).json({ message: 'Cannot find favourite' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
  res.favourite = favourite;
  next();
}

// listen to server
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Server started on port ${port}`));
// ```




exports.addToWishlist = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(400).json({ message: 'Product not found' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $push: { wishlist: { product: product } },
      },
      { new: true }
    );

    res.status(200).json({ message: 'Product added to wishlist', wishlist: updatedUser.wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Error adding product to wishlist', error: error.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { wishlist: { product: productId } } },
      { new: true }
    );

    res.status(200).json({ message: 'Product removed from wishlist', wishlist: updatedUser.wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Error removing product from wishlist', error: error.message });
  }
};

exports.getWishlist = async (req, res) => {
  const { userId } = req.query;

  try {
    const user = await User.findById(userId).populate('wishlist.product');

    res.status(200).json({ wishlist: user.wishlist });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wishlist', error: error.message });
  }
};


userRouter.delete("/api/delete-cart/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    let user = await User.findById(req.user);
    for (let i = 0; i < user.cart.length; i++) {
      if (user.cart[i].product._id.equals(product._id)) {
        if (user.cart[i].quantity >= 1) {
          // user.cart[i].quantity +=2;
        }
      }
    }

    res.status(200).json({ msg: "product successfully deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});















userRouter.put("/api/favourite", auth, async (req, res) => {
  try {
    // const { id } = req.params;
    // let user = await User.findById(req.user);
    // const product = Product.findById(id);
    // const exit = user.wishlist.find((ids) => ids.toString() == id);
    // if (exit) {
    //   await findByIdAndDelete(id, { new: true });
    // } else {
    //   user.cart.wishlist.push(product);
    // }
    // const existingFavourite = await favourite.findOne({ user, id });
    // if (existingFavourite) {
    //   await favourite.deleteOne({ user, id });
    //   // res.json({msg: ""})
    // } else {
    //   await favourite.insertOne({ user, id });
    // }
    // res.json({ msg: "ok" });
    const { id } = req.body;
    let user = await User.findById(req.user);
    const product = Product.findById(id);
    const updatedCart = user.cart.filter(
      (item) => item.product._id.toString() !== id
    );
    if (updatedCart) {
      const updatedUser = await User.findByIdAndUpdate(
        req.user,
        { $pull: { wishlist: { product: product } } },
        { new: true }
      );
      res.json(updatedUser);
    } else {
      const updatedUser = await User.findByIdAndUpdate(
        req.user,
        { $pull: { wishlist: { product: id } } },
        { new: true }
      );
      res.json(updatedUser);
    }
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