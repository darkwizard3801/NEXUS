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

module.exports = {
  addRatingReview,
};
