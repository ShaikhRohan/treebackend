const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productname: {
    type: String,
    required: true
  },
  f3Price: {
    type: Number,
    required: true
  },
  capital: {
    type: Number,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  f3prices: {
    type: Number,
    required: true
  },
  usdtprices: {
    type: Number,
    required: true
  },
  qty: {
    type: Number,
    required: true
  },
  totalfiatprice: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    enum: ['kg', 'mg', 'ltr','ml','pack','box'],
    required: true
  },
  contactnumber: {
    type: String,
    required: true
  },
  housenumber: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  images: {
    type: [String],
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tree',
    required: true
  }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
