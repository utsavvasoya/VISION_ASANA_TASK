const mongoose = require('mongoose')
const url = "mongodb://localhost:27017/16-01-2022_Student"

const database = mongoose.connect(url, (err, succ) => {
    if (err) {
        throw err;
    }
    console.log("DataBase Connected")
})

module.exports = database