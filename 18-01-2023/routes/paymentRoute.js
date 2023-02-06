const express = require('express');
const router = express.Router();
const { payForPaypal, successPaymentPaypal, paymentStripe } = require('../controller/paymentController');

router.post('/pay', payForPaypal)
router.get('/success', successPaymentPaypal)
router.get('/cancel', (req, res) => res.send('Cancelled'));
router.post('/paymentStripe', paymentStripe)

module.exports = router;