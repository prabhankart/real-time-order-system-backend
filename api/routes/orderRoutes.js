const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, getOrderById, exportOrders,updateOrderStatus } = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');
const upload = require('../config/cloudinaryConfig');
const { validate, orderSchema } = require('../validation/schemas');
const admin = require('../middleware/adminMiddleware');

// Apply validation middleware before the controller
router.post('/', auth, upload.single('invoice'), validate(orderSchema), createOrder);

router.get('/', auth, getAllOrders);
router.get('/export', auth, exportOrders);
router.get('/:id', auth, getOrderById);
// Add this new route for updating status
router.put('/:id/status', [auth, admin], updateOrderStatus);

module.exports = router;