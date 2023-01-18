const mongoose = require('mongoose');
const studentSchema = new mongoose.Schema({
    name: {
        type: String
    },
    address: {
        type: String,
    },
    class: {
        type: Number
    },
    age: {
        type: Number
    },
    hobbies: {
        type: Array
    },
    gender: {
        type: String
    },
    stateId: {
        type: String
    },
    cityId: {
        type: String,
    },
    pincode: {
        type: String,
    },
    photo: {
        type: String
    }
})

module.exports = mongoose.model("student", studentSchema)
