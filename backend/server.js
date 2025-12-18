const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Database connection
const connectDB = require('./config/db');
connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/messages', require('./routes/messages'));

// Socket.io connection
const userSockets = {}; // Store user socket connections
const adminSockets = {}; // Store admin socket connections

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Customer joins
  socket.on('customer-join', (data) => {
    const { userId, name } = data;
    userSockets[userId] = socket.id;
    socket.userId = userId;
    socket.userType = 'customer';
    
    // Notify all admins about new customer
    Object.values(adminSockets).forEach(adminSocketId => {
      io.to(adminSocketId).emit('customer-online', { userId, name });
    });
    
    console.log(`Customer ${name} joined with ID: ${userId}`);
  });

  // Admin joins
  socket.on('admin-join', (data) => {
    const { adminId, name } = data;
    adminSockets[adminId] = socket.id;
    socket.adminId = adminId;
    socket.userType = 'admin';
    
    console.log(`Admin ${name} joined with ID: ${adminId}`);
  });

  // Customer sends message
  socket.on('customer-message', async (data) => {
    const { userId, message, userName } = data;
    
    const messageData = {
      userId,
      userName,
      message,
      sender: 'customer',
      timestamp: new Date()
    };

    // Save message to database
    const Message = require('./models/Message');
    try {
      const newMessage = new Message({
        userId,
        userName,
        message,
        sender: 'customer'
      });
      await newMessage.save();
    } catch (error) {
      console.error('Error saving message:', error);
    }

    // Send to all admins
    Object.values(adminSockets).forEach(adminSocketId => {
      io.to(adminSocketId).emit('new-customer-message', messageData);
    });

    // Echo back to customer
    socket.emit('message-sent', messageData);
  });

  // Admin sends message
  socket.on('admin-message', async (data) => {
    const { userId, message, adminName } = data;
    
    const messageData = {
      userId,
      message,
      sender: 'admin',
      adminName,
      timestamp: new Date()
    };

    // Save message to database
    const Message = require('./models/Message');
    try {
      const newMessage = new Message({
        userId,
        message,
        sender: 'admin',
        adminName
      });
      await newMessage.save();
    } catch (error) {
      console.error('Error saving message:', error);
    }

    // Send to customer if online
    const customerSocketId = userSockets[userId];
    if (customerSocketId) {
      io.to(customerSocketId).emit('admin-reply', messageData);
    }

    // Send to all admins
    Object.values(adminSockets).forEach(adminSocketId => {
      io.to(adminSocketId).emit('admin-message-sent', messageData);
    });
  });

  // Typing indicators
  socket.on('customer-typing', (data) => {
    const { userId, userName } = data;
    Object.values(adminSockets).forEach(adminSocketId => {
      io.to(adminSocketId).emit('customer-typing', { userId, userName });
    });
  });

  socket.on('admin-typing', (data) => {
    const { userId } = data;
    const customerSocketId = userSockets[userId];
    if (customerSocketId) {
      io.to(customerSocketId).emit('admin-typing');
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    
    if (socket.userType === 'customer' && socket.userId) {
      delete userSockets[socket.userId];
      // Notify admins
      Object.values(adminSockets).forEach(adminSocketId => {
        io.to(adminSocketId).emit('customer-offline', { userId: socket.userId });
      });
    } else if (socket.userType === 'admin' && socket.adminId) {
      delete adminSockets[socket.adminId];
    }
  });
});

const PORT = process.env.PORT || 5003;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});