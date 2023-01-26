const express = require("express");
const bodyParser = require("body-parser");
require('dotenv').config()
const database = require('./config/db');
const app = express();
app.use(express.json());
// app.use(bodyParser.json());
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use("/", require("./routes/studentRoute"));
app.use("/", require("./routes/loginRoute"));



app.listen(process.env.PORT, console.log(`Listerning server at port ${process.env.PORT}`))