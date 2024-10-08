const mongoose = require('mongoose');

// Define the event schema
const eventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true, // Indicates that this field is required
  },
  occasion: {
    type: String,
    required: true, // Indicates that this field is required
  },
  budget: {
    type: [Number], // Assuming budget is an array for minimum and maximum values
    required: true, // Indicates that this field is required
  },
  guests: {
    type: Number,
    required: true, // Indicates that this field is required
  },
  phoneNumber: {
    type: String,
    required: true, // Indicates that this field is required
  },
  date: {
    type: Date,
    required: true, // Indicates that this field is required
  },
  location: {
    lat: {
      type: Number,
      required: true, // Indicates that this field is required
    },
    lng: {
      type: Number,
      required: true, // Indicates that this field is required
    },
  },
  createdBy: {
    email: {
      type: String,
      required: true, // Email of the user who created the event
    },
    username: {
      type: String,
      required: true, // Username of the user who created the event
    },
  },
  status: {
    type: String,
    enum: ['active', 'cancelled','delivered'], // Define possible statuses
    default: 'active', // Default status is active
  },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt fields

// Create the Event model
const Event = mongoose.model('Event', eventSchema);

// Export the Event model
module.exports = Event;
