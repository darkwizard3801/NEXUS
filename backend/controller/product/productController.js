const Product = require('../../models/productModel');

// Controller to disable a product
const disableProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { disabled: true }, // Disable the product
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product disabled successfully', product: updatedProduct });
  } catch (error) {
    console.error('Error disabling product:', error);
    res.status(500).json({ message: 'Failed to disable product' });
  }
};

// Controller to enable a product
const enableProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { disabled: false }, // Enable the product
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json({ message: 'Product enabled successfully', product: updatedProduct });
  } catch (error) {
    console.error('Error enabling product:', error);
    res.status(500).json({ message: 'Failed to enable product' });
  }
};

module.exports = { disableProduct, enableProduct };
