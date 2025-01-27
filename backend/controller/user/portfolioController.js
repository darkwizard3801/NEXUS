const PortfolioData = require('../../models/PortfolioData');

const storeFormData = async (req, res) => {
  try {
    const { userEmail, tagline, aboutText, location, aboutFile, portfolioFiles } = req.body;
    
    let portfolioData = await PortfolioData.findOne({ userEmail });

    if (portfolioData) {
      portfolioData.tagline = tagline;
      portfolioData.aboutText = aboutText;
      
      if (aboutFile) {
        portfolioData.aboutFile = aboutFile;
      }

      if (portfolioFiles && portfolioFiles.length > 0) {
        const nextEventNumber = portfolioData.portfolioEvents.length + 1;
        
        const newEvent = {
          location,
          eventNumber: nextEventNumber,
          files: portfolioFiles,
          createdAt: new Date()
        };

        portfolioData.portfolioEvents.push(newEvent);
      }

      await portfolioData.save();
    } else {
      const firstEvent = portfolioFiles?.length > 0 ? [{
        location,
        eventNumber: 1,
        files: portfolioFiles,
        createdAt: new Date()
      }] : [];

      portfolioData = new PortfolioData({
        userEmail,
        tagline,
        aboutText,
        aboutFile,
        portfolioEvents: firstEvent
      });

      await portfolioData.save();
    }

    res.status(201).json({ 
      success: true,
      message: 'Portfolio submitted successfully',
      data: portfolioData
    });

  } catch (error) {
    console.error('Error storing portfolio data:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to submit portfolio',
      details: error.message 
    });
  }
};

const getPortfolioDetails = async (req, res) => {
  try {
    const { userEmail } = req.body;
    
    const portfolioDetails = await PortfolioData.findOne({ userEmail });

    if (!portfolioDetails) {
      return res.status(404).json({ 
        success: false,
        error: 'Portfolio not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: portfolioDetails
    });

  } catch (error) {
    console.error('Error fetching portfolio details:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error fetching portfolio details' 
    });
  }
};

module.exports = { 
  storeFormData, 
  getPortfolioDetails 
};
