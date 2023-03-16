const express = require("express");
const userRouter = express.Router();
const auth = require("../middlewares/auth_middlewares");
const { Product } = require("../models/product_model");
// const KycModel = require("../models/kycmodel");
const User = require("../models/user_auth_model");

userRouter.post("api/add-to-cart", auth, async (req, res) => {
  try {
    const { id } = req.body;

    const product = await Product.findById(id);
    let user = await User.findById(req.user);

    if (user.cart.length == 0) {
      user.cart.push({ product, quantity });
    } else {
      let isProductFound = false;
      for (let i = 0; i < user.cart.length; i++) {
        if (user.cart[i].product._id.equals(product._id)) {
          isProductFound = true;
        }
      }
      if (isProductFound) {
        let pro = user.cart.find((proc) => {
          proc.product._id.equals(product._id);
        });
        pro.quantity += 1;
      } else {
        user.cart.push({ product, quantity: 1 });
      }
    }
    user = await user.save();
    res.json(user);
  } catch (error) {}
});

//              ??????????????????????????????????????????????????!

//              ???????????????????????????????????????????????????

userRouter.post("/api/save-user-address", auth, async (req, res) => {
  try {
    const { error } = validateAddress(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    // retrieve the use object
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    console.log(req.body);

    const {
      firstName,
      middleName,
      addressLine1,
      addressLine2,
      addressLine3,
      postalCode,
      locality,
      landmark,
      mobileNumber,
      emailAddress,
      aadhaarNumber,
      panCardNumber,
    } = req.body;

    user.address.push({
      firstName,
      middleName,
      addressLine1,
      addressLine2,
      addressLine3,
      postalCode,
      locality,
      landmark,
      mobileNumber,
      emailAddress,
      aadhaarNumber,
      panCardNumber,
    });
    // save the user object back to the database
    const updatedUser = await user.save();

    // res.status(200).json({ msg: "User address saved successfully" });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
}),
  //              ??????????????????????????????????????????????????!

  //              ???????????????????????????????????????????????????

  //remove from cart
  userRouter.post("api/remove-from-cart/:id", auth, async (req, res) => {
    try {
      const { id } = req.body;
      const product = await Product.findById(id);
      const user = await User.findById(req.user);
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

module.exports = userRouter;

//              ??????????????????????????????????????????????????!

//              ???????????????????????????????????????????????????

function validateAddress(address) {
  const Joi = require("joi");

  const schema = Joi.object({
    firstName: Joi.string().required(),
    middleName: Joi.string().required(),
    addressLine1: Joi.string().required(),
    addressLine2: Joi.string().required(),
    addressLine3: Joi.string().required(),
    postalCode: Joi.string().required(),
    locality: Joi.string().required(),
    landmark: Joi.string().required(),
    mobileNumber: Joi.string().required(),
    emailAddress: Joi.string().trim().email().required(),
    aadhaarNumber: Joi.string().required(),
    panCardNumber: Joi.string().required(),
  });

  return schema.validate(address);
}
