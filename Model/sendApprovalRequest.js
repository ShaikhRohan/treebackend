const mongoose = require('mongoose');

const sendApprovalRequest = new mongoose.Schema({
    productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  totalFiatPrice: {
    type: Number,
    required: true
  },
  walletAddress: {
    type: String,
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  accept: {
    type: Number,
    enum: [0, 1],
    default : 0,
  }
});

const Approval = mongoose.model('Approval', sendApprovalRequest);

module.exports = Approval;
