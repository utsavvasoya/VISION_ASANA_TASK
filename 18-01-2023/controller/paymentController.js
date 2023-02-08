const paypal = require('paypal-rest-sdk');
const paymentSchema = require("../models/payment");
const stripe = require('stripe')('sk_test_Czcmd6nNU3pu0sUjKGT3TYAf')
const ApiContracts = require("authorizenet").APIContracts;
const ApiControllers = require("authorizenet").APIControllers;
const validator = require('validator');

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
    const errors = [];
    if (!validator.isCreditCard(req.body.cardnumber)) {
        errors.push({
            param: 'cc',
            msg: 'Invalid credit card number.'
        });
    }

    if (!/^\d{3}$/.test(req.body.cvc)) {
        errors.push({
            param: 'cvv',
            msg: 'Invalid CVV code.'
        });
    }

    if (!/^\d{4}$/.test(req.body.expdate)) {
        errors.push({
            param: 'expire',
            msg: 'Invalid expiration date.'
        });
    }

    if (!validator.isDecimal(req.body.price)) {
        errors.push({
            param: 'amount',
            msg: 'Invalid amount.'
        });
    }
    if (errors.length > 0) {
        return res.json({ error: "Enter valid card details." })
    }
    var exp = req.body.expdate
    var exp_month = exp.slice(0, 2)
    var exp_year = exp.slice(2, 4)
    stripe.customers.create({
        name: req.body.bookname
    })
        .then(async (customer) => {
            const card_token = await stripe.tokens.create({
                card: {
                    number: req.body.cardnumber,
                    exp_month: exp_month,
                    exp_year: exp_year,
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
            res.json({ message: "Success" })
        })
        .catch((err) => {
            console.log(err);
            res.json({ error: err.message })
        });
}

exports.authorize = async (req, res) => {
    const { cc, cvv, expire, amount } = req.body;
    const errors = [];
    if (!validator.isCreditCard(cc)) {
        errors.push({
            param: 'cc',
            msg: 'Invalid credit card number.'
        });
    }

    if (!/^\d{3}$/.test(cvv)) {
        errors.push({
            param: 'cvv',
            msg: 'Invalid CVV code.'
        });
    }

    if (!/^\d{4}$/.test(expire)) {
        errors.push({
            param: 'expire',
            msg: 'Invalid expiration date.'
        });
    }

    if (!validator.isDecimal(amount)) {
        errors.push({
            param: 'amount',
            msg: 'Invalid amount.'
        });
    }
    if (errors.length > 0) {
        return res.json({ error: "Enter valid card details." })
    }

    const merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
    merchantAuthenticationType.setName(process.env.API_LOGIN_ID);
    merchantAuthenticationType.setTransactionKey(process.env.TRANSACTION_KEY);

    const creditCard = new ApiContracts.CreditCardType();
    creditCard.setCardNumber(cc);
    creditCard.setExpirationDate(expire);
    creditCard.setCardCode(cvv);

    const paymentType = new ApiContracts.PaymentType();
    paymentType.setCreditCard(creditCard);

    const transactionSetting = new ApiContracts.SettingType();
    transactionSetting.setSettingName('recurringBilling');
    transactionSetting.setSettingValue('false');

    const transactionSettingList = [];
    transactionSettingList.push(transactionSetting);

    const transactionSettings = new ApiContracts.ArrayOfSetting();
    transactionSettings.setSetting(transactionSettingList);

    const transactionRequestType = new ApiContracts.TransactionRequestType();
    transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
    transactionRequestType.setPayment(paymentType);
    transactionRequestType.setAmount(amount);
    transactionRequestType.setTransactionSettings(transactionSettings);

    const createRequest = new ApiContracts.CreateTransactionRequest();
    createRequest.setMerchantAuthentication(merchantAuthenticationType);
    createRequest.setTransactionRequest(transactionRequestType);
    console.log(JSON.stringify(createRequest.getJSON(), null, 2));
    const ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());
    ctrl.execute(async () => {
        const apiResponse = ctrl.getResponse();
        const response = new ApiContracts.CreateTransactionResponse(apiResponse);
        if (response !== null) {
            if (response.getMessages().getResultCode() === ApiContracts.MessageTypeEnum.OK) {
                if (response.getTransactionResponse().getMessages() !== null) {
                    const newpayment = new paymentSchema({
                        paymentId: response.transactionResponse.transId,
                        paymentAmount: amount,
                        paymentMethod: "Authorize.Net",
                        paymentCurrency: "USD"
                    });
                    await newpayment.save();
                    console.log('Successfully created transaction with transaction ID: ' + response.getTransactionResponse().getTransId());
                    console.log('Response Code: ' + response.getTransactionResponse().getResponseCode());
                    console.log('Message Code: ' + response.getTransactionResponse().getMessages().getMessage()[0].getCode());
                    console.log('Description: ' + response.getTransactionResponse().getMessages().getMessage()[0].getDescription());
                    res.json({ message: 'Transaction was successful.' });
                } else {
                    if (response.getTransactionResponse().getErrors() !== null) {
                        let code = response.getTransactionResponse().getErrors().getError()[0].getErrorCode();
                        let text = response.getTransactionResponse().getErrors().getError()[0].getErrorText();
                        res.json({
                            error: `${code}: ${text}`
                        });
                    } else {
                        res.json({ error: 'Transaction failed.' });
                    }
                }
            } else {
                if (response.getTransactionResponse() !== null && response.getTransactionResponse().getErrors() !== null) {
                    let code = response.getTransactionResponse().getErrors().getError()[0].getErrorCode();
                    let text = response.getTransactionResponse().getErrors().getError()[0].getErrorText();
                    res.json({
                        error: `${code}: ${text}`
                    });
                } else {
                    let code = response.getMessages().getMessage()[0].getCode();
                    let text = response.getMessages().getMessage()[0].getText();
                    res.json({
                        error: `${code}: ${text}`
                    });
                }
            }

        } else {
            res.json({ error: 'No response.' });
        }
    });
}
