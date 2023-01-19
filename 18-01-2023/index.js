const express = require("express");
const database = require('./config/db');
const port = 3000;
const app = express();
app.use(express.json());

app.use("/", require("./routes/studentRoute"));



app.listen(port, console.log(`Listerning server at port ${port}`))