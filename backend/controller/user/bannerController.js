const Banner = require('../../models/Banner');

// Function to handle banner requests
const handleBannerRequest = async (req, res) => {
  const { banner, description, email, username, position } = req.body;

  // Validate required fields
  if (!banner) {
    return res.status(400).json({ error: 'Banner image is required' });
  }

  if (!email || !username) {
    return res.status(400).json({ error: 'Email and username are required' });
  }

  if (!position) {
    return res.status(400).json({ error: 'Position is required' });
  }

  // Validate position against allowed values
  const allowedPositions = ['top', 'center-1', 'center-2', 'center-3', 'bottom'];
  if (!allowedPositions.includes(position)) {
    return res.status(400).json({ error: 'Invalid position value' });
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Save the base64-encoded image, description, email, username, position, and status to the database
  try {
    const newBanner = new Banner({
      image: banner,
      description,
      email,
      username,
      position,
      isActive: true, // Automatically set isActive to true
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

// Function to fetch all banners from the database
const fetchBanners = async (req, res) => {
  try {
    const banners = await Banner.find(); // Fetch all banners
    res.json({
      message: 'Banners retrieved successfully',
      banners,
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Function to enable or disable a banner
const toggleBannerStatus = async (req, res) => {
  try {
    const { bannerId } = req.params; // Get the banner ID from the request parameters

    // Find the banner by ID
    const banner = await Banner.findById(bannerId);

    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    // Toggle the isActive field
    banner.isActive = !banner.isActive;

    // Save the updated banner
    await banner.save();

    return res.status(200).json({
      message: `Banner is now ${banner.isActive ? "disabled" : "enabled"}`,
      isActive: banner.isActive,
    });
  } catch (error) {
    console.error("Error toggling banner status:", error);
    return res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// Function to update banner status
const updateBannerStatus = async (req, res) => {
  try {
    const { status } = req.body; // Get the new status from the request body
    const bannerId = req.params.id; // Get the banner ID from the request parameters

    // Find the banner and update its status
    const banner = await Banner.findByIdAndUpdate(bannerId, { status }, { new: true });

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    res.status(200).json({
      message: 'Banner status updated successfully',
      banner,
    });
  } catch (error) {
    console.error('Error updating banner status:', error);
    res.status(500).json({ message: 'Failed to update banner status', error });
  }
};

module.exports = {
  handleBannerRequest,
  fetchBanners,
  toggleBannerStatus,
  updateBannerStatus, // Export the update status function
};
