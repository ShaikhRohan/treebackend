const mongoose = require('mongoose');

const fundManagementSchema = new mongoose.Schema({
    datetimecreated: {
        type: Date,
        default: Date.now
 },
  f3amount: {
    type: Number,
    required: true
  },
  usdtvalue: {
    type: Number,
    required: true
  },
  fiatvalue: {
    type: Number,
    required: true
  },
  usdtpricecreationtime: {
    type: Number,
    required: true
  },
  f3pricecreationtime: {
    type: Number,
    required: true
  },
  fiatpricecreationtime: {
    type: Number,
    required: true
  },
  usdtvaluenow: {
    type: Number,
    required: true
  },
  pl: {
    type: Number,
    required: true
  },
  idnumber: {
    type: Number,
    required: true
  },
  purchasednumber: {
    type: Number,
    required: true
  },
  accumulatednumberofproducts: {
    type: Number,
    required: true
  },
  accumulatedfiatamount: {
    type: Number,
    required: true
  },
  f3value: {
    type: Number,
    required: true
  },
  usdttvalue: {
    type: Number,
    required: true
  },
  buyerwalletaddress: {
    type: String,
    required: true
  },
  currency: {
    type: String,
    required: true
  },
  senderid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tree',
    required: true
  },
});

const FundManagement = mongoose.model('Funds', fundManagementSchema);

module.exports = FundManagement;
