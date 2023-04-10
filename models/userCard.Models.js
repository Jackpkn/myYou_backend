const mongoose = require("mongoose");

const cardSchema = mongoose.Schema({
  cardName: {
    type: String,
    required: false,
  },
  cardNumber: {
    type: String,
    required: true,
    unique: true,
  },
  cardExpMonth: {
    type: String,
    required: true
  },
  cardExpYear: {
    type: String,
    required: true,
  },
  cardCVC: {
    type: String,
    required: true,
  },
  customerId: {
    type: String,
    required: true,
  },
  // it is stripe it which will use for checking that the the user exit or not

  cardId: {
    type: String,
    required: true,
  },
});

const cardModel = mongoose.model("CustomerCards", cardSchema);
module.exports = cardModel;
