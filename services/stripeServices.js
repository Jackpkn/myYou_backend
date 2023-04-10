const STRIPE_CONFIG = require("../config");
const stripe = require("stripe")(STRIPE_CONFIG.STRIPE_KEY);

const express = require("express");
const User = require("../models/user_auth_model");
const cardModel = require("../models/userCard.Models");

const auth = require("../middlewares/auth_middlewares");

const stripeRoute = express.Router();
// best we check that the cardId is already exits or not 
stripeRoute.post("/payment", auth, async (req, res) => {
  try {
    stripe.paymentIntents.create({});
  } catch (error) {
    res.json({ error: error.message });
  }
});
