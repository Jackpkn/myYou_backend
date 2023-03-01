const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const user_Auth_schema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    // lowercase: true,
    trim:true
  },
  email: {
    required:true,
    type: String,
     trim: true,
    // lowercase: true,
    // unique: true,
    validator: {
      validator: (value) => {
        const emailRegex =
          /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return value.match(REGEXP);
      },
      msg: "Please Enter a valid email address",
    },
  },
  password: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'user'
  },
  cart: [
     
  ]
});
const User = mongoose.model("user", user_Auth_schema);

module.exports = User;
// user_Auth_schema.pre("save", async function (next) {
//   try {
//     if (this.isNew) {
//       const salt = await bcrypt.genSalt(10);
//       const hashedPassword = await bcrypt.hash(this.password, salt);
//       this.password = hashedPassword;
//     }
//     next();
//   } catch (error) {
//     next();
//   }
// });
// user_Auth_schema.methods.isValidPassword = async function (password) {
//   try {
//     return await bcrypt.compare(password, this.password);
//   } catch (error) {
//     throw error;
//   }
// };


// ^ matches the start of the string
// (?=.*[a-z]) checks if the string contains at least one lowercase letter
// (?=.*[A-Z]) checks if the string contains at least one uppercase letter
// (?=.*\d) checks if the string contains at least one digit
// [A-Za-z\d]{8,} matches the actual password, which must be at least 8 characters long and can only contain letters and digits
// $ matches the end of the string
 // validator: {
    //   validator: (value) => {
    //     const passwordRegex =
    //       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    //     return value.match(passwordRegex);
    //   },
    //   msg: "The password must contain at least one lowercase letter, one digit , and password must be 8 characters long",
    // },