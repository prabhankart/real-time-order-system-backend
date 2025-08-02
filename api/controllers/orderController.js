const Order = require('../models/Order');
const User = require('../models/User');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.createOrder = async (req, res) => {
    const { customerName, orderAmount } = req.body;
    const userId = req.user.userId;

    if (!req.file || !req.file.path) {
        return res.status(400).json({ message: 'Invoice file upload failed.' });
    }

    const invoiceFileUrl = req.file.path;

    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        
        const customerEmail = user.email;

        const order = new Order({
            customerName,
            customerEmail,
            orderAmount: parseFloat(orderAmount),
            invoiceFileUrl,
        });
        await order.save();

        const msg = {
            to: customerEmail,
            from: process.env.SENDGRID_VERIFIED_SENDER,
            subject: 'Your Order has been created!',
            text: `Hi ${customerName},\n\nThank you for your order of $${orderAmount}.\nYour Order ID is: ${order._id}`,
        };
        await sgMail.send(msg);
        
        res.status(201).json(order);
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ message: 'Server error while creating order.' });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ orderDate: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ msg: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.exportOrders = async (req, res) => {
    try {
        const orders = await Order.find();
        const jsonOrders = JSON.stringify(orders, null, 2);
        res.header('Content-Disposition', 'attachment; filename="orders.json"');
        res.type('application/json');
        res.send(jsonOrders);
    } catch (error) {
        res.status(500).send('Server error');
    }
};