const mongoose = require('mongoose');

const storeAppliationSchema = new mongoose.Schema({
  storename: {
    type: String,
    required: true,
    unique : true
  },
  city: {
    type: String,
    required: true
  },
  localpalace: {
    type: String,
    required: true
  },
  street: {
    type: String,
    required: true
  },
  building: {
    type: String,
    required: true
  },
  approve: {
    type: Number,
    enum: [0, 1],
    required: true,
    default : 0
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tree',
    required: true
  }
});

const StoreApplication = mongoose.model('Storeapplication', storeAppliationSchema);

module.exports = StoreApplication;
