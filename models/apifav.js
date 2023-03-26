// Please make sure to install `express`, `mongoose`, `body-parser`, and `cors` packages before implementing the following code. 

// ```
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

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