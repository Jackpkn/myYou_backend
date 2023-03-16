const mongoose = require("mongoose");
const kycSchema = mongoose.Schema({
  fistName: {
    type: String,
    required: true,
  },
  middleName: {
    type: String,
    required: true,
  },
  addressLine1: {
    type: String,
    required: true,
  },
  addressLine2: {
    type: String,
    required: true,
  },
  addressLine3: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  locality: {
    type: String,
    required: true,
  },
  landmark: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: String,
    required: true,
  },
  emailAddress: {
    type: String,
    trim: true,
    required: true,
  },
  // Aadhaar & PAN INFORMATION
  aadhaarNumber: {
    type: String,
    required: true,
    trim: true,
  },
  panCardNumber: {
    type: String,
    required: true,
    trim: true,
  },
});

module.exports =kycSchema;