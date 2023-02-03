const express = require('express');
const router = express.Router();
const { pay, successPayment } = require('../controller/paymentController');

router.post('/pay', pay)
router.get('/success', successPayment)
router.get('/cancel', (req, res) => res.send('Cancelled'));

module.exports = router;