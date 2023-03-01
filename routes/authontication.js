const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');
//initialize the authRouter
const authRouter = express.Router();
// initialize userModel
const createError = require("http-errors");
const auth = require('../middlewares/auth_middlewares')
const user_Schema = require("../models/user_auth_model");
const { token } = require("morgan");
//!
 
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
 
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const bodyParser = require("body-parser");
require('dotenv').config();

const app = express();
const port = 3000;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// Set up middleware
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

authRouter.post('/auth/google-signin', async (req, res) => {
  try {
    const { idToken } = req.body;

    // Verify the token using the Google Auth library
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    // Check that the token was issued by Google and intended for our client ID
    if (payload.iss !== "accounts.google.com" && payload.iss !== "https://accounts.google.com") {
      throw new Error("Invalid token issuer");
    }
    if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      throw new Error("Invalid token audience");
    }

    // Create a JSON Web Token (JWT) using the user's profile information
    const token = jwt.sign({
      sub: payload.sub,
      name: payload.name,
      email: payload.email,
      picture: payload.picture
    }, process.env.JWT_SECRET, { expiresIn: "1h" });
     res.send('print ') 
    // Return the JWT to the client
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid token" });
  }
});



//!
authRouter.post("/auth/signUp", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const doesExist = await user_Schema.findOne({ email });
    if (doesExist) {
      return res
        .status(400)
        .json({ msg: "User with same email already exists!" });
      // throw createError.Conflict(`${email} is already been registered`);
    }
    const hashPassword = await bcrypt.hash(password, 8);
    let user = new user_Schema({ email, password: hashPassword, name });
    user = await user.save();
   res.json(user)
    
  } catch (error) {
    res.status(500).json({ error: error.message });
    next(error);
  }
});

authRouter.post("/auth/login", async (req, res, next) => {
  try {
    
    const { email, password } = req.body;

    const user = await user_Schema.findOne({ email });
     
    if (!user) {
      return res
        .status(400)
        .json({ msg: "User with this email does not exist" });
    }
   
    const isMatch = await bcrypt.compare(password,user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Incorrect password" });
     
    };
    
    const token = jwt.sign({ id: user._id }, "passwordKey");
    res.json({token, ...user._doc});
  } catch (error) {
    
      res.status(500).json({ error: e.message });
  
  }
});
authRouter.post('/tokenValid', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) return res.json(false);
    const verified = jwt.verify(token, 'passwordKey');
    if (!verified) return res.json(false);
    const user = await user_Schema.findById(verified.id);
    if(!user)return res.json(false)
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  
});
authRouter.get('/getUser', auth, async (req, res) => {
  const user = await user_Schema.findById(req.user);
  res.json({...this.use._doc, token: req.token});
})
 

module.exports = authRouter;
