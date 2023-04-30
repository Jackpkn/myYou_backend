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


app.get('/search', function (req, res) {
  const keyword = req.query.keyword;
  const category = req.query.category;
  const minPrice = req.query.minPrice;
  const maxPrice = req.query.maxPrice;

  db.collection('products').find({
    $or: [
      { name: { $regex: keyword, $options: 'i' } },
      { description: { $regex: keyword, $options: 'i' } }
    ],
    category: category,
    price: {
      $gte: minPrice,
      $lte: maxPrice
    }
  }, function (err, result) {
    if (err) throw err;

    const data = result.toArray();
    res.send(data);
  });
});


// To upload an image to Amazon S3 using Flutter and Node.js, follow these steps:

// Set up an Amazon S3 bucket
// First, sign in to your AWS Management Console and create a new S3 bucket or use an existing one.
// Set up Node.js server
// Create a Node.js project by running npm init.

// Install the required packages: aws - sdk, express, cors, and multer using npm.

// npm install aws - sdk express cors multer
// Configure the Node.js server
// In your project, create a new file called server.js, and add the following code to set up the server:
// const express = require('express');
// const cors = require('cors');
// const multer = require('multer');
// const AWS = require('aws-sdk');

// const app = express();
// app.use(cors());

// const storage = multer.memoryStorage({
//   destination: function (req, file, callback) {
//     callback(null, '');
//   }
// });
// const upload = multer({ storage }).single('image');

// const s3 = new AWS.S3({
//   accessKeyId: 'YOUR_S3_ACCESS_KEY',
//   secretAccessKey: 'YOUR_S3_SECRET_ACCESS_KEY',
//   region: 'YOUR_S3_REGION'
// });

// app.post('/upload', upload, (req, res) => {
//   const params = {
//     Bucket: 'YOUR_S3_BUCKET_NAME',
//     Key: req.file.originalname,
//     Body: req.file.buffer,
//     ContentType: req.file.mimetype,
//     ACL: 'public-read'
//   };

//   s3.upload(params, (err, data) => {
//     if (err) {
//       return res.status(500).send(err);
//     }
//     res.status(200).send(data.Location);
//   });
// });

// const port = process.env.PORT || 3000;
// app.listen(port, () => console.log(`Server started on port ${port}`));
// Replace 'YOUR_S3_ACCESS_KEY', 'YOUR_S3_SECRET_ACCESS_KEY', 'YOUR_S3_REGION', and 'YOUR_S3_BUCKET_NAME' with your actual S3 credentials and bucket name.

// Start the Node.js server
// Run node server.js to start the server.
// Create a Flutter app and add a dependency
// Create a new Flutter app using the flutter create command if you don't already have one.
// In your pubspec.yaml file, add the following dependency:
// dependencies:
//    ...
// http: ^ 0.13.3
// Create a Flutter UI for image selection and upload
// In your main.dart file or another screen - specific file, build a simple UI that allows the user to select an image from their device and then upload it to S3.
//   import 'dart:convert';
// import 'dart:io';
// import 'package:flutter/material.dart';
// import 'package:http/http.dart' as http;
// import 'package:image_picker/image_picker.dart';

// class ImageUploadScreen extends StatefulWidget {
//   @override
//   _ImageUploadScreenState createState() => _ImageUploadScreenState();
// }

// class _ImageUploadScreenState extends State<ImageUploadScreen> {
//   File _selectedImage;
//   final picker = ImagePicker();
//   bool _isLoading = false;

//   Future pickImage() async {
//     final pickedFile = await picker.pickImage(source: ImageSource.gallery);

//   setState(() {
//     if (pickedFile != null) {
//       _selectedImage = File(pickedFile.path);
//     } else {
//       print('No image selected.');
//     }
//   });
// }

// // Method to upload the image to the Node.js server.
// Future < void> uploadImage(File imageFile) async {
//     String apiUrl = "http://your_api_url:PORT/upload";
//   try {
//     setState(() {
//       _isLoading = true;
//     });

//     var imageBytes = imageFile.readAsBytesSync();
//       String base64Image = base64Encode(imageBytes);

//       final response = await http.post(
//       Uri.parse(apiUrl),
//       headers: { "Content-Type": "application/json" },
//       body: json.encode({
//         "image": base64Image,
//         "name": _selectedImage.path.split('/').last,
//       }),
//     );

//     setState(() {
//       _isLoading = false;
//     });

//     if (response.statusCode == 200) {
//       ScaffoldMessenger.of(context).showSnackBar(
//         SnackBar(content: Text("Image uploaded successfully")),
//       );
//     } else {
//       ScaffoldMessenger.of(context).showSnackBar(
//         SnackBar(content: Text("Image upload failed")),
//       );
//     }
//   } catch (error) {
//     print(error);
//     setState(() {
//       _isLoading = false;
//     });
//   }
// }

// @override
//   Widget build(BuildContext context) {
//   return Scaffold(
//     appBar: AppBar(title: Text('S3 Image Upload')),
//     body: Center(
//       child: Column(
//         mainAxisAlignment: MainAxisAlignment.center,
//         crossAxisAlignment: CrossAxisAlignment.center,
//         children: [
//         _selectedImage != null
//           ? Image.file(_selectedImage)
//           : Text("No image selected"),
//         SizedBox(height: 20),
//         OutlinedButton.icon(
//           onPressed: pickImage,
//           icon: Icon(Icons.photo),
//           label: Text("Select Image"),
//         ),
//         SizedBox(height: 20),
//         _isLoading
//           ? CircularProgressIndicator()
//           : OutlinedButton.icon(
//             onPressed: _selectedImage != null
//             ? () {
//               uploadImage(_selectedImage);
//             }
//             : null,
//             icon: Icon(Icons.cloud_upload),
//             label: Text("Upload Image"),
//           ),
//       ],
//       ),
//     ),
//   );
// }
// }
// Replace your_api_url:PORT with the actual URL and port of your Node.js server.

//   Now, you have a working Flutter app that allows users to select an image from their device and upload it to Amazon S3 using Node.js as an intermediary server.