const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    unique: true // Ensure that each category is unique
  },
  label: {
    type: String,
    required: true, // Make label required
  },
  productImage: {
    type: [String], // Store images as an array of Base64 strings
    required: true // Make image field required
  },
  disabled: {
    type: Boolean,
    default: false, // Add disabled field with default value as false
  }
}, {
  timestamps: true // Optional: Add timestamps for createdAt and updatedAt
});

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
