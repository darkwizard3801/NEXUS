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
        const currentTimestamp = new Date();

        const newEventFiles = portfolioFiles.map(file => ({
          ...file,
          location,
          createdAt: currentTimestamp,
          eventNumber: (portfolioData.portfolioFiles.length > 0 
            ? Math.max(...portfolioData.portfolioFiles.map(f => f.eventNumber || 0)) + 1 
            : 1)
        }));

        portfolioData.portfolioFiles = [...portfolioData.portfolioFiles, ...newEventFiles];
      }

      await portfolioData.save();
    } else {
      const newEventFiles = portfolioFiles?.map(file => ({
        ...file,
        location,
        createdAt: new Date(),
        eventNumber: 1
      })) || [];

      portfolioData = new PortfolioData({
        userEmail,
        tagline,
        aboutText,
        aboutFile,
        portfolioFiles: newEventFiles
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
