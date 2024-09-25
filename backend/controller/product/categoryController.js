const Category = require('../../models/categoryModel');

// Fetch all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({}, 'category label productImage disabled'); // Include the disabled field in the fetched data
    res.status(200).json({ data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error); // Log the error for debugging
    res.status(500).json({ message: 'Error fetching categories', error: error.message });
  }
};

// Add a new category
exports.addCategory = async (req, res) => {
  const { category, label, image } = req.body; // Include image in destructuring

  // Validate category, label, and image input
  if (!category || category.trim() === '' || !label || label.trim() === '' || !image) {
    return res.status(400).json({ message: 'Category name, label, and image are required' });
  }

  try {
    // Check if the category already exists
    const existingCategory = await Category.findOne({ category: category.trim() });
    if (existingCategory) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    // Create a new category with label, image, and disabled set to false
    const newCategory = new Category({ 
      category: category.trim(), 
      label: label.trim(), 
      productImage: [image], // Save the image in an array
      disabled: false // Default to enabled
    });
    await newCategory.save();

    res.status(201).json({ message: 'Category added successfully!', data: newCategory });
  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ message: 'Error adding category', error: error.message });
  }
};

// Toggle the disabled state of a category
exports.toggleCategory = async (req, res) => {
  const { id } = req.params; // Get category ID from URL parameters
  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Toggle the disabled state
    category.disabled = !category.disabled;
    await category.save();

    res.status(200).json({ message: 'Category status updated successfully!', data: category });
  } catch (error) {
    console.error('Error toggling category status:', error);
    res.status(500).json({ message: 'Error toggling category status', error: error.message });
  }
};
