const express = require("express");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const authRouter = express.Router();
const uploadImage = require("../middlewares/multer");

const auth = require("../middlewares/auth_middlewares");
const user_Schema = require("../models/user_auth_model");
// const client = require("twilio")(
//   process.env.ACCOUNT_SID,
//   process.env.AUTH_TOKEN
// );
const expressAsyncHandler = require("express-async-handler");
const User = require("../models/user_auth_model");
const { OAuth2Client } = require("google-auth-library");
const CLIENT_id = process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_API_ID
const oAuth2Client = new OAuth2Client(CLIENT_id)

const kycModel = require("../models/kycmodel");
authRouter.post('/api/auth/google-signin', async (req, res) => {
  const { idToken, accessToken } = req.body;

  try {
    console.log('jack')
    const googleUser = await oAuth2Client.verifyIdToken({ idToken, audience: CLIENT_ID });

    if (!googleUser) {
      return res.status(401).json({ message: 'Google verification failed.' });
    }

    const payload = googleUser.getPayload();

    //     //     // Check if the user exists in your database
    let user = await User.findOne({ googleId: payload.sub });

    if (!user) {
      //       //       // If the user does not exist, create a new user
      user = new User({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name,
        image: payload.picture,
      });

      await user.save();
    }

    //     //     // Generate your unique JWT token for this user or perform other actions

    console.log('success');
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error occurred during authentication.' });
  }
});


//              ??????????????????????????????????????????????????!

//              ???????????????????????????????????????????????????

authRouter.post(
  "/auth/signUp",
  uploadImage.single(),
  async (req, res, next) => {
    try {
      const { name, email, password, phone } = req.body;

      const doesExist = await user_Schema.findOne({ email });
      if (doesExist) {
        return res
          .status(400)
          .json({ msg: "User with same email already exists!" });
        // throw createError.Conflict(`${email} is already been registered`);
      } // if(user.findOne({email}))
      const hashPassword = await bcrypt.hash(password, 8);

      let user = new user_Schema({
        name,
        email,
        phone,
        password: hashPassword,
      });
      user = await user.save();
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
      next(error);
    }
  }
);

//              ??????????????????????????????????????????????????!

// ???????????????????????????????????????????

//              ???????????????????????????????????????????????????

authRouter.post("/auth/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await user_Schema.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ msg: "User with this email does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect password" });
    }

    const token = jwt.sign({ id: user._id }, "passwordKey");
    res.json({ token, ...user._doc });
  } catch (error) {
    res.status(500).json({ error: e.message });
  }
});

//              ??????????????????????????????????????????????????!

// ???????????????????????????????????????????

//              ???????????????????????????????????????????????????

authRouter.post("/auth/tokenValid", async (req, res) => {
  try {
    const token = req.header("x-auth-token");
    if (!token) return res.json(false);
    const verified = jwt.verify(token, "passwordKey");
    console.log(token);
    if (!verified) return res.json(false);
    const user = await user_Schema.findById(verified.id);
    if (!user) return res.json(false);
    res.json(true);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
authRouter.get("/auth/getUser", auth, async (req, res) => {
  const user = await user_Schema.findById(req.user);
  res.json({ ...user._doc, token: req.token });
});

//              ??????????????????????????????????????????????????!

// ???????????????????????????????????????????

//              ???????????????????????????????????????????????????
authRouter.get("/auth/changePassword", async (req, res) => {
  if (req.query.phone) {
    client.verify
      .services(process.env.SERVICE_ID)
      .verifications.create({
        to: `+${req.query.phone}`,
        channel: req.query.channel === "call" ? "call" : "sms",
      })
      .then((data) => {
        res.status(200).send({
          message: "Verification is sent!!",
          phone: req.query.phone,
          data,
        });
      });
  } else {
    res.status(400).send({
      message: "Wrong phone number :(",
      phone: req.query.phone,
      data,
    });
  }
});
authRouter.get("/verify", async (req, res) => {
  if (req.query.phone && req.query.code.length === 4) {
    client.verify
      .services(process.env.SERVICE_ID)
      .verificationChecks.create({
        to: `+${req.query.phone}`,
        code: req.query.code,
      })
      .then(async (data) => {
        if (data.status === "approved") {
          const user = User.findById(req.user);
          if (await bcrypt.compare(req.body.currentPassword, user.password)) {
            User.updateOne(
              { _id: mongoose.Types.ObjectId(req.user.id) },
              {
                $set: {
                  password: await bcrypt.hash(req.body.newPassword, 10),
                },
              }
            ).then(
              res.status(200).json({ msg: "Password changed successfully" })
            );
          }

          res.status(200).json({
            message: "User is Verified!!",
            data,
          });
        }
      });
  }
  // else {
  //   res.status(400).send({
  //     message: "Wrong phone number or code :(",
  //     phone: req.query.phone,
  //     data,
  //   });
  // }
  else {
    return res.status(401).json({ msg: "Password didn't match" });
  }
});
authRouter.post(
  "/auth/changePassword",
  auth,
  expressAsyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.user);
      if (await bcrypt.compare(req.body.currentPassword, user.password)) {
        User.updateOne(
          { _id: mongoose.Types.ObjectId(req.user) },
          {
            $set: {
              password: await bcrypt.hash(req.body.newPassword, 10),
            },
          }
        ).then(res.status(200).json({ msg: "Password changed successfully" }));
      } else {
        return res.status(401).json({ msg: "Password didn't match" });
      }
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  })
);

authRouter.post("/auth/save-user-address", auth, async (req, res) => {
  try {
    // const { error } = validateAddress(req.body);
    // if (error) {
    //   return res.status(400).json({ error: error.details[0].message });
    // }
    // retrieve the user object
    const user = await User.findById(req.user);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    // console.log(req.body);

    const {
      firstName,
      middleName,
      lastName,
      addressLine1,
      addressLine2,
      addressLine3,
      postalCode,
      landmark,
      locality,
      mobileNumber,
      emailAddress,
      aadhaarNumber,
      panCardNumber,
    } = req.body;
    // user.address.push

    user.address.push({
      firstName,
      middleName,
      lastName,
      addressLine1,
      addressLine2,
      addressLine3,
      postalCode,
      landmark,
      locality,
      mobileNumber,
      emailAddress,
      aadhaarNumber,
      panCardNumber,
    });

    // save the user object back to the database
    await user.save();

    res.status(200).json({ msg: "Your address saved successfully" });
    // res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
}),
  authRouter.put("/auth/update-user-profile/:id", async (req, res) => {
    try {
      const { name, email, userName, phone } = req.body;
      const doesExist = await user_Schema.findOne({ email });
      if (doesExist) {
        return res
          .status(404)
          .json({ msg: "User with same email already exists!" });
        // throw createError.Conflict(`${email} is already been registered`);
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            name,
            email,
            userName,
            phone,
          },
        },
        { new: true }
      );
      const user = await updatedUser.save();
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
      console.log(error);
    }
  });

authRouter.put("/auth/update-user-address", async (req, res) => {
  try {
    const {
      firstName,
      middleName,
      lastName,
      addressLine1,
      addressLine2,
      addressLine3,
      postalCode,
      landmark,
      locality,
      mobileNumber,
      emailAddress,
      aadhaarNumber,
      panCardNumber,
    } = req.body;
    user = User.findByIdAndUpdate(
      req.user,
      {
        $set: {
          address: {
            firstName,
            middleName,
            lastName,
            addressLine1,
            addressLine2,
            addressLine3,
            postalCode,
            landmark,
            locality,
            mobileNumber,
            emailAddress,
            aadhaarNumber,
            panCardNumber,
          },
        },
      },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
        } else {
          console.log(updatedUser);
          res.status(200).json(updatedUser);
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error);
  }
});


module.exports = authRouter;


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
