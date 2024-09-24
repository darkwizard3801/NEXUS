// controllers/productController.js
const Product = require('../../models/productModel'); // Assuming your product model is named `Product`

// Fetch Products by Category
const getProductsByCategory = async (req, res) => {
  try {
    const category = req.query.category;

    // Check if a category is provided
    let products;
    if (category && category !== '') {
      // Fetch products that match the given category
      products = await Product.find({ category });
    } else {
      // Fetch all products if no category is provided
      products = await Product.find({});
    }

    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: error.message,
    });
  }
};

// Fetch All Categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category'); // Fetch distinct categories from the product model

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message,
    });
  }
};

module.exports = {
  getProductsByCategory,
  getAllCategories,
};
