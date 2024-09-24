const Banner = require('../../models/Banner');

const handleBannerRequest = async (req, res) => {
  const { banner, description, email, username } = req.body;

  if (!banner) {
    return res.status(400).json({ error: 'Banner image is required' });
  }

  if (!email || !username) {
    return res.status(400).json({ error: 'Email and username are required' });
  }

  // Save the base64-encoded image, description, email, and username to the database
  try {
    const newBanner = new Banner({
      image: banner,
      description,
      email,
      username,
    });

    const savedBanner = await newBanner.save();

    res.json({
      message: 'Banner request received successfully',
      banner: savedBanner,
    });
  } catch (error) {
    console.error('Error saving to database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  handleBannerRequest,
};