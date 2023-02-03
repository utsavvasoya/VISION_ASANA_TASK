const express = require("express");
require('dotenv').config()
const database = require('./config/db');
const app = express();
app.use(express.json());
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
const paypal = require('paypal-rest-sdk');

app.use("/", require("./routes/studentRoute"));
app.use("/", require("./routes/loginRoute"));
app.use("/", require("./routes/paymentRoute"));

paypal.configure({
    'mode': 'sandbox',
    'client_id': process.env.client_id,
    'client_secret': process.env.client_secret
});
app.listen(process.env.PORT, console.log(`Listerning server at port ${process.env.PORT}`))