const mongoose = require('mongoose');

const NodeSchema = new mongoose.Schema({
  value: {
    type: String,
    required: true,
    unique : true
  },
  level: {
    type: Number,
    required: true,
  },
  left: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node',
  },
  right: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Node',
  },
  parent : {
    type: mongoose.Schema.Types.ObjectId,
    ref : 'Tree'
  },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Node', NodeSchema);
