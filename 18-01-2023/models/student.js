const mongoose = require('mongoose');
const studentSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'registers'
    },
    english: {
        type: Number
    },
    maths: {
        type: Number
    },
    hindi: {
        type: Number
    },
    gujarati: {
        type: Number
    },
    science: {
        type: Number
    }
});
module.exports = mongoose.model("student", studentSchema);
