const mongoose = require('mongoose');

const sendApprovalRequest = new mongoose.Schema({
  purchaseNumber: {
    type: Number,
    unique: true
  },
    productId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  sellerUniqueId: {
    type: Number,
    required : true
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
  privatekey: {
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
  },
  uniqueId: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  }
});

const Approval = mongoose.model('Approval', sendApprovalRequest);

module.exports = Approval;
