const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const User = require('../models/User');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create a Razorpay order
exports.createRazorpayOrder = async (req, res) => {
    const { amount } = req.body;
    try {
        const options = {
            amount: amount * 100, // Amount in the smallest currency unit (paise)
            currency: "INR",
        };
        const order = await instance.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500).send("Server Error");
    }
};

// Verify the payment and create the final order
exports.verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, cartItems } = req.body;
    const userId = req.user.userId;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature === razorpay_signature) {
        // Payment is authentic, now create the order in your database
        try {
            const user = await User.findById(userId);
            const customerEmail = user.email;
            
            // For simplicity, we'll create one order for the whole cart
            const totalAmount = cartItems.reduce((sum, item) => sum + item.price, 0);

            const order = new Order({
                customerName: user.email, // Or another name field if you have one
                customerEmail,
                orderAmount: totalAmount,
                invoiceFileUrl: 'placeholder-invoice.pdf', // You can generate a real one later
                user: userId,
            });
            await order.save();

            const msg = {
                to: customerEmail,
                from: process.env.SENDGRID_VERIFIED_SENDER,
                subject: 'Your Order has been placed!',
                text: `Thank you for your purchase of $${totalAmount}. Your Order ID is: ${order._id}`,
            };
            await sgMail.send(msg);

            res.json({ message: "Payment successful and order created!" });
        } catch (err) {
            res.status(500).send("Server Error");
        }
    } else {
        res.status(400).send("Invalid signature");
    }
};