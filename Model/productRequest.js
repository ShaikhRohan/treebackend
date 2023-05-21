const mongoose = require('mongoose');

const productRequest = new mongoose.Schema({
  productName: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  productId: {
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

const ProductRequest = mongoose.model('ProductRequest', productRequest);

module.exports = ProductRequest;
