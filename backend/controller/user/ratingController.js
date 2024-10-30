const Rating = require('../../models/ratingModel'); // Replace with your actual rating model path
const Order = require('../../models/orderModel'); // Replace with your actual order model path

// Add rating and review for an order
const addRatingReview = async (req, res) => {
  try {
    const { orderId,productId, rating, comment } = req.body;

    // Check if the order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Create a new rating object
    const newRating = new Rating({
      orderId,
      productId,
      rating,
      review: comment,
    });

    // Save the rating to the database
    await newRating.save();

    res.status(201).json({
      success: true,
      message: 'Rating and review added successfully',
      data: newRating,
    });
  } catch (error) {
    console.error('Error adding rating and review:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add rating and review',
    });
  }
};

// New controller to fetch rating details
const getRatingDetails = async (req, res) => {
  try {
    // Fetch all rating details from the database
    const ratings = await Rating.find({});
    
    if (ratings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No ratings found',
      });
    }

    res.status(200).json({
      success: true,
      data: ratings,
    });
  } catch (error) {
    console.error('Error fetching ratings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ratings',
    });
  }

};

// Exporting the controllers
module.exports = {
  addRatingReview,
  getRatingDetails, // Export the new controller
};
