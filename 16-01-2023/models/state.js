const mongoose = require('mongoose');
const stateSchema = new mongoose.Schema({
    id: {
        type: String,
    },
    name: {
        type: String,
    }
})

module.exports = mongoose.model("state", stateSchema)
