const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  review: {
    type: String,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Rating', ratingSchema);
