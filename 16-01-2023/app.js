const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const database = require('./config/db');
const port = 3001;
app.use(express.json());
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));


app.use('/', require('./routes/studentRoute'))
app.listen(port, console.log(`Listerning server at port ${port}`))