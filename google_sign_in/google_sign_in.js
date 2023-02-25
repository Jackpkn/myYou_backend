const express = require('express');
const cors = require('cors');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const bodyParser = require("body-parser");
require('dotenv').config();

const app = express();
const port = 4000;
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Set up middleware
app.use(cors());
app.use(helmet());
app.use(bodyParser.json());

// Set up rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use("/api/", apiLimiter);

// Endpoint to handle Google Sign-in request
app.post('/api/google-signin', async (req, res) => {
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

    // Return the JWT to the client
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Invalid token" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
