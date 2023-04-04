const mongoose = require('mongoose');

const requestCenter = new mongoose.Schema({
  requestSenderUniqueId: {
    type: String,
    required: true
  },
  requestSenderObjectId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  requestReceiverUniqueId: {
    type: String,
    required: true
  },
  requestReceiverObjectId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  accept: {
    type: Number,
    enum: [0, 1],
    default : 0,
    required: true
  }
});

const Request = mongoose.model('Request', requestCenter);

module.exports = Request;
