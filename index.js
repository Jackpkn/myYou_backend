require('dotenv').config();
const express = require('express');
const app = express();
const httpError = require('http-errors');
const cors = require('cors');
const morgan = require('morgan');
//insert authontication 
require("./routes/authontication");
require('./mongodb_connection');
 app.use(cors())
 app.use(morgan('dev'))
const port = process.env.PORT;
 

app.get('/', (req, res) => {
    res.send('successfully connected');
});



















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
        }
    })
})

app.listen(port, () => {
    console.log(`server is running on localhost://${port}`);
});


