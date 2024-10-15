const Order = require('../../models/orderModel');

const createOrUpdateOrder = async (req, res) => {
    try {
        let { userEmail, userName, address, products, totalPrice, discount, finalAmount } = req.body;

        // If address is an array, convert it to a string
        if (Array.isArray(address)) {
            address = address.join(', ');
        }

        // Validation checks
        if (!userEmail || !userName || !address || !products || totalPrice === undefined || finalAmount === undefined) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Check for an existing order
        const existingOrder = await Order.findOne({ userEmail, status: "pending" });

        if (existingOrder) {
            // Update existing order
            existingOrder.userName = userName;
            existingOrder.address = address;
            existingOrder.products = products;
            existingOrder.totalPrice = totalPrice;
            existingOrder.discount = discount;
            existingOrder.finalAmount = finalAmount;

            // Save the updated order
            await existingOrder.save();

            return res.status(200).json({ success: true, message: 'Order updated successfully', data: existingOrder });
        } else {
            // Create a new order
            const newOrder = new Order({
                userEmail,
                userName,
                address,
                products,
                totalPrice,
                discount,
                finalAmount,
                status: 'pending' // Assuming a status field exists to track order status
            });

            // Save the order to the database
            await newOrder.save();

            return res.status(201).json({ success: true, message: 'Order placed successfully', data: newOrder });
        }
    } catch (error) {
        console.error('Error creating or updating order:', error);
        return res.status(500).json({ success: false, message: 'Failed to create or update the order', error: error.message });
    }
};

module.exports = {
    createOrUpdateOrder,
};
