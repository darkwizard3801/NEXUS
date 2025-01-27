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
  portfolioEvents: [{
    location: String,
    eventNumber: Number,
    files: [{
      data: String,
      contentType: String
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

const PortfolioData = mongoose.model('PortfolioData', portfolioSchema);

module.exports = PortfolioData; 