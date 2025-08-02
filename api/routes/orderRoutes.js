const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, getOrderById, exportOrders } = require('../controllers/orderController');
const auth = require('../middleware/authMiddleware');
const upload = require('../config/cloudinaryConfig');
const { validate, orderSchema } = require('../validation/schemas');

// Apply validation middleware before the controller
router.post('/', auth, upload.single('invoice'), validate(orderSchema), createOrder);

router.get('/', auth, getAllOrders);
router.get('/export', auth, exportOrders);
router.get('/:id', auth, getOrderById);

module.exports = router;