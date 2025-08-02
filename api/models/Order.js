const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  orderAmount: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
  invoiceFileUrl: { type: String, required: true },
});

module.exports = mongoose.model('Order', OrderSchema);