const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app); // Create an http server from the Express app

// Configure Socket.IO to use the http server
const io = new Server(server, {
  cors: {
    origin: "*", // Allows your frontend to connect
    methods: ["GET", "POST"]
  }
});

// Make the 'io' instance available to your controllers
app.set('socketio', io);

// Handle new WebSocket connections
io.on('connection', (socket) => {
  console.log('A user connected via WebSocket');
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected...'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

// Core Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', require('./api/routes/authRoutes'));
app.use('/orders', require('./api/routes/orderRoutes'));
app.use('/api/products', require('./api/routes/productRoutes'));
app.use('/api/payment', require('./api/routes/paymentRoutes'));

const PORT = process.env.PORT || 5000;

// IMPORTANT: Use 'server.listen' to start both Express and Socket.IO
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = server; // <-- ADD THIS LINE