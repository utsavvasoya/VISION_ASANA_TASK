const mongoose = require('mongoose')
const url = process.env.DB_URL

const database = mongoose.connect(url, (err, succ) => {
    if (err) {
        throw err;
    }
    console.log("DataBase Connected")
})

module.exports = database