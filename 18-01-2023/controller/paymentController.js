const paypal = require('paypal-rest-sdk');
const paymentSchema = require("../models/payment");
const stripe = require('stripe')('sk_test_51KCGKeSHA3evzryH3R6yRrg7YYlZgk8jrTUysWtb6YQETYQkpzZJzXmk6Os8G7LDAcDqNyhZJnUY8phPp29HVVte00rijlPyZK')

exports.payForPaypal = async (req, res) => {
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:3001/success",
            "cancel_url": "http://localhost:3001/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": req.body.bookname,
                    "price": req.body.price,
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": req.body.price
            }
        }]
    }
    paypal.payment.create(create_payment_json, (error, payment) => {
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    res.json({ message: payment.links[i].href });
                }
            }
        }
    });
}
exports.successPaymentPaypal = async (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
    };
    paypal.payment.execute(paymentId, execute_payment_json, async (error, payment) => {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            const newpayment = new paymentSchema({
                paymentId,
                paymentAmount: payment.transactions[0].amount.total,
                paymentMethod: payment.payer.payment_method,
                paymentCurrency: payment.transactions[0].amount.currency
            });
            await newpayment.save();
            res.redirect('/home')
        }
    });
}

exports.paymentStripe = async (req, res) => {
    var price = req.body.price
    var bookname = req.body.bookname
    stripe.customers.create({
        email: req.body.stripeEmail,
        source: req.body.stripeToken,
    })
        .then((customer) => {
            return stripe.charges.create({
                amount: req.body.amount * 100,
                description: req.body.description,
                currency: 'INR',
                customer: customer.id
            });
        })
        .then((charge) => {
            res.send("Success")
            console.log(charge)
        })
        .catch((err) => {
            res.send("Invalid Card number")
        });
}
