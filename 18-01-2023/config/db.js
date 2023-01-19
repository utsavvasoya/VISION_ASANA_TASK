const mongoose = require('mongoose')
const url = "mongodb://localhost:27017/18-01-2022_StudentWithMarks"

const database = mongoose.connect(url, (err, succ) => {
    if (err) {
        throw err;
    }
    console.log("DataBase Connected")
})

module.exports = database