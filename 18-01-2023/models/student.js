const mongoose = require('mongoose');
const studentSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'registers'
    },
    subjects: {
        type: Array
    }
});
module.exports = mongoose.model("student", studentSchema);
