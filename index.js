require("dotenv").config();
const express = require("express");
const app = express();
const httpError = require("http-errors");
const cors = require("cors");
const morgan = require("morgan");
const productRouter = require("./routes/products");
const AuthRoute = require("./routes/authontication");
const AdminRoute = require("./routes/admin/adminadd");
const userRouter = require("./routes/user");
const categoryRoute = require("./routes/category");
const orderRouter = require("./routes/order");

require("./routes/authontication");
require("./mongodb_connection");
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.static("public"));
const port = process.env.PORT;

app.get("/", (req, res) => {
  res.send("successfully connected");
});
app.use("/", AuthRoute);
app.use("/", AdminRoute);
app.use("/", userRouter);
app.use("/", productRouter);
app.use("/", categoryRoute);
app.use('/', orderRouter);
// app.use("/upload", express.static("upload"));
// for handling http error
app.use(async (req, res, next) => {
  next(httpError.NotFound());
});
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message,
    },
  });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`server is running on localhost://${port}`);
});
