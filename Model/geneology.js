const mongoose = require('mongoose');

const requestCenter = new mongoose.Schema({
  placementnode: {
    type: Number,
    unique:true,
    required: true
  },
  leftnode: {
    type: Number,
  },
  rightnode: {
    type: Number,
  },
  parentnode: {
    type: Number,
  },
  level: {
    type: Number,
    required: true,
  },
  created_at: { type: Date, default: Date.now }
});

const Geneology = mongoose.model('Geneology', requestCenter);

module.exports = Geneology;
