const paypal = require('paypal-rest-sdk');
const paymentSchema = require("../models/payment");
const stripe = require('stripe')('sk_test_Czcmd6nNU3pu0sUjKGT3TYAf')

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
    var exp = req.body.expdate
    var expDate = exp.split('/')
    stripe.customers.create({
        name: req.body.bookname
    })
        .then(async (customer) => {
            const card_token = await stripe.tokens.create({
                card: {
                    number: req.body.cardnumber,
                    exp_month: expDate[0],
                    exp_year: expDate[1],
                    cvc: req.body.cvc
                }
            })
            const card = await stripe.customers.createSource(customer.id, {
                source: card_token.id
            })
            return stripe.charges.create({
                amount: req.body.price * 100,
                description: req.body.bookname,
                currency: 'INR',
                customer: customer.id
            });
        })
        .then(async (charge) => {
            const newpayment = new paymentSchema({
                paymentId: charge.id,
                paymentAmount: charge.amount,
                paymentMethod: "Stripe",
                paymentCurrency: charge.currency
            });
            await newpayment.save();
            res.send("Success")
        })
        .catch((err) => {
            console.log(err);
            res.send("Invalid Card number")
        });
}
