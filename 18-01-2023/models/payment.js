const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema({
    paymentId: {
        type: String
    },
    paymentMethod: {
        type: String
    },
    paymentAmount: {
        type: Number
    },
    paymentCurrency: {
        type: String
    }
});
module.exports = mongoose.model("payment", paymentSchema);
