const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String
  },
  message: {
    type: String,
    required: true
  },
  sender: {
    type: String,
    enum: ['customer', 'admin'],
    required: true
  },
  adminName: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Message', messageSchema);

