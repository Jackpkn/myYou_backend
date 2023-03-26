const mongoose = require("mongoose");
const ratingSchema = mongoose.Schema({
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  star: {
    type: Number,
    required: true,
  },
  message: {
    type: String,
  },
});
module.exports = ratingSchema;
