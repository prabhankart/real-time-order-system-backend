const Order = require('../models/Order');
const User = require('../models/User');
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Logic to create a new order

exports.createOrder = async (req, res) => {
        console.log('--- create order Reached ---'); // <-- ADD THIS
    const { customerName, orderAmount } = req.body;
    const userId = req.user.userId;

    if (!req.file || !req.file.path) {
        return res.status(400).json({ message: 'Invoice file upload failed.' });
    }

    const invoiceFileUrl = req.file.path;

    try {
          console.log('--- create order Reached ---'); // <-- ADD THIS
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });
        
        const customerEmail = user.email;

        const order = new Order({
            customerName,
            customerEmail,
            orderAmount: parseFloat(orderAmount),
            invoiceFileUrl,
            user: userId,
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
        // This will now print the full, detailed error message
        console.error('Error creating order:', err); 
        res.status(500).json({ message: 'Server error while creating order.' });
    }
};

// Logic to get orders based on user role
// Replace the old getAllOrders function with this new one
exports.getAllOrders = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ message: 'User not found.' });

        // --- NEW: Pagination, Search, and Filter Logic ---
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const status = req.query.status || 'All';

        let query = {};

        // If the user is a customer, they can only see their own orders
        if (user.role === 'customer') {
            query.user = req.user.userId;
        }

        // Add search filter (searches by customer name)
        if (search) {
            query.customerName = { $regex: search, $options: 'i' }; // 'i' for case-insensitive
        }

        // Add status filter
        if (status !== 'All') {
            query.status = status;
        }

        const orders = await Order.find(query)
            .sort({ orderDate: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        
        const totalOrders = await Order.countDocuments(query);

        res.json({
            orders,
            totalPages: Math.ceil(totalOrders / limit),
            currentPage: page,
        });

    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};
// Logic to get a single order by ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Logic to export orders as JSON
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
// Add this new function to the file
exports.updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        order.status = status;
        await order.save();
        res.json(order);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};