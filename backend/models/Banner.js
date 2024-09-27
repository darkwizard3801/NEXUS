const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  position: {
    type: String,
    enum: ['top', 'center-1', 'center-2', 'center-3', 'bottom'], // Enum to restrict possible values
    required: true, // Make this field required
  },
  isActive: {
    type: Boolean,
    default: true, // Default value to active
  },
  status: {
    type: String,
    enum: ['submitted', 'approved', 'pending', 'waitlisted', 'rejected'], // Enum for status options
    default: 'submitted', // Default value
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Banner', bannerSchema);
