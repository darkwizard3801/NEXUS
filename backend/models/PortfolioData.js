const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
  },
  tagline: String,
  aboutText: String,
  
  aboutFile: {
    data: String,  // Will store base64 string
    contentType: String  // Will store mime type
  },
  portfolioFiles: [{
    data: String,  // Will store base64 string
    contentType: String,
    location: String,  // Will store mime type
    eventNumber: Number,
    createdAt: Date
  }],
}, { timestamps: true });

const PortfolioData = mongoose.model('PortfolioData', portfolioSchema);

module.exports = PortfolioData; 