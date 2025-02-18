const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  productId: { // New field for product ID
    type: mongoose.Schema.Types.ObjectId,
    ref: 'product', // Assuming you have a Product model
    required: true, // Make it required if necessary
  },
  userEmail: {  // Added userEmail field
    type: String,
    required: true,
    trim: true,
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
