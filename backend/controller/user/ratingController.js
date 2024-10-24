const Rating = require('../../models/ratingModel'); // Replace with your actual rating model path
const Order = require('../../models/orderModel'); // Replace with your actual order model path

// Add rating and review for an order
const addRatingReview = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;

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
    const { orderId } = req.params;

    // Fetch the rating details for the given orderId
    const ratingDetails = await Rating.findOne({ orderId });
    if (!ratingDetails) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found for this order',
      });
    }

    res.status(200).json({
      success: true,
      data: ratingDetails,
    });
  } catch (error) {
    console.error('Error fetching rating details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rating details',
    });
  }
};

// Exporting the controllers
module.exports = {
  addRatingReview,
  getRatingDetails, // Export the new controller
};
