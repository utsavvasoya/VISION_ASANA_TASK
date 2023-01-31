const mongoose = require('mongoose');
const registerSchema = new mongoose.Schema({
    username: {
        type: String
    },
    email: {
        type: String
    },
    password: {
        type: String,
    }
});
module.exports = mongoose.model("register", registerSchema);
