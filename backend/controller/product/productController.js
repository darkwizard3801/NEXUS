const Product = require('../../models/productModel');
const cron = require('node-cron');
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

const updateSponsorStatus = async (req, res) => {
  try {
    const { id } = req.params; // Get product ID from URL parameters
    const { sponsor } = req.body; // Get the sponsor status from the request body

    // Find the product by ID and update the sponsor field
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { sponsor: sponsor }, // Update the sponsor field
      { new: true } // Return the updated document
    );

    // Check if the product was found and updated
    if (!updatedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // If the sponsor status is set to true, schedule it to revert after a week
    if (sponsor) {
      // Schedule a job to update the sponsor status to false after 1 week
      cron.schedule('* * * * *', async () => {
        const revertDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Current time + 1 week
        if (Date.now() >= revertDate) {
          await Product.findByIdAndUpdate(id, { sponsor: false });
          console.log('Sponsor status reverted to false for product ID:', id);
        }
      });
    }

    // Send a success response
    res.status(200).json({
      success: true,
      message: 'Sponsor status updated successfully',
      data: updatedProduct,
    });
  } catch (error) {
    console.error('Error updating sponsor status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update sponsor status',
    });
  }
};

module.exports = { disableProduct, enableProduct, updateSponsorStatus };
