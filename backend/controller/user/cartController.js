const CartModel = require('../../models/cartProduct'); // Adjust path as necessary

// Clear cart controller
exports.clearCart = async (req, res) => {
    try {
        const userId = req.userId; // Use the user ID from the authenticated request

        // Clear all items in the cart for the current user
        await CartModel.deleteMany({ userId });

        return res.status(200).json({
            success: true,
            message: 'Cart cleared successfully.',
        });
    } catch (error) {
        console.error('Error clearing cart:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while clearing the cart.',
        });
    }
};
