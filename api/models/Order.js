const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  orderAmount: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now },
  invoiceFileUrl: { type: String, required: true },
  status: { 
    type: String, 
    default: 'Pending',
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] 
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // <-- ADD THIS LINE
});

module.exports = mongoose.model('Order', OrderSchema);
//kkk