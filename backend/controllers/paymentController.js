const catchAsyncErrors = require("../middleware/catchAsyncErrors");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const crypto = require("crypto");
// const axios = require("axios");

exports.processPayment = catchAsyncErrors(async (req, res, next) => {
    const myPayment = await stripe.paymentIntents.create({
        amount: req.body.amount,
        currency: "usd",
        metadata: {
            company: "Ecommerce",
        },
    });

    res.status(200).json({ success: true, client_secret: myPayment.client_secret });
});

exports.sendStripeApiKey = catchAsyncErrors(async (req, res, next) => {
    res.status(200).json({ stripeApiKey: process.env.STRIPE_API_KEY });
});


exports.processMomoPayment = catchAsyncErrors(async (req, res, next) => {
    const endpoint = 'https://test-payment.momo.vn/gw_payment/transactionProcessor';
    const partnerCode = "";
    const accessKey = "";
    const serectkey = "";
    const orderInfo = 'Payment for order #' + req.body.orderId;
    const returnUrl = 'http://localhost:3000';
    const notifyurl = 'http://localhost:3000';
    const amount = req.body.amount;
    const orderId = req.body.orderId;
    const requestId = orderId;
    const requestType = 'captureMoMoWallet';
    const extraData = 'merchantName=;merchantId=';

    const rawSignature = `partnerCode=${partnerCode}&accessKey=${accessKey}&requestId=${requestId}&amount=${amount}&orderId=${orderId}&orderInfo=${orderInfo}&returnUrl=${returnUrl}&notifyUrl=${notifyurl}&extraData=${extraData}`;
    const signature = crypto.createHmac('sha256', serectkey).update(rawSignature).digest('hex');
    const data = {
        partnerCode,
        accessKey,
        requestId,
        amount,
        orderId,
        orderInfo,
        returnUrl,
        notifyurl,
        extraData,
        requestType,
        signature
    };

    const response = await axios.post(endpoint, data);
    if (response.data && response.data.payUrl) {
        res.status(200).json({ success: true, payUrl: response.data.payUrl });
    } else {
        res.status(200).json({ success: false, payUrl: response.data.payUrl });
    }

})


