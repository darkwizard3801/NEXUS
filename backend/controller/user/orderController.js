const Order = require('../../models/orderModel');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

const createOrUpdateOrder = async (req, res) => {
    try {
        let { userEmail, userName, address, products, totalPrice, discount, finalAmount,deliveryDate } = req.body;

        // If address is an array, convert it to a string
        if (Array.isArray(address)) {
            address = address.join(', ');
        }

        // Validation checks
        if (!userEmail || !userName || !address || !products || !deliveryDate || totalPrice === undefined || finalAmount === undefined) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        // Check for an existing order
        const existingOrder = await Order.findOne({ userEmail, status: "Pending" });

        if (existingOrder) {
            // Update existing order
            existingOrder.userName = userName;
            existingOrder.address = address;
            existingOrder.products = products;
            existingOrder.totalPrice = totalPrice;
            existingOrder.discount = discount;
            existingOrder.finalAmount = finalAmount;
            existingOrder.deliveryDate = deliveryDate;

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
                deliveryDate,
                status: 'Pending' // Assuming a status field exists to track order status
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

const getAllOrders = async (req, res) => {
    try {
        // Fetch all orders from the database
        const orders = await Order.find();

        // Check if any orders are found
        if (!orders || orders.length === 0) {
            return res.status(404).json({ success: false, message: 'No orders found' });
        }

        // Return the orders data
        return res.status(200).json({ success: true, message: 'Orders retrieved successfully', data: orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch orders', error: error.message });
    }
};



const updateOrderWithPayment = async (req, res) => {
    const { paymentId, orderDetails } = req.body;

    try {
        // Ensure order exists
        const order = await Order.findOne({ _id: orderDetails.orderId }); // Use the existing order ID
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        // Update order with payment details
        order.paymentId = paymentId;
        order.status = 'Ordered'; // Change the status to 'Ordered'
        order.invoiceNumber = uuidv4(); // Generate a unique invoice number

        // Save the updated order
        await order.save();

        // Set up nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'Gmail', // e.g., Gmail
            auth: {
                user: process.env.EMAIL, // Use your environment variable for the email
                pass: process.env.EMAIL_PASSWORD, // Use your environment variable for the password or app password
            },
        });

        // Prepare email details
        const productDetails = order.products.map((product) => {
            return `
                <div style="border: 1px solid #ddd; padding: 10px; margin-bottom: 10px;">
                    <h3 style="margin: 0;">${product.productName} x ${product.quantity} </h3>
                    <img src="${product.image}" alt="${product.productName}" style="width: 100%; max-width: 200px; height: auto;" />
                   
                </div>`;
        }).join('');

        const mailOptions = {
            from: process.env.EMAIL_USER, // Sender address
            to: order.userEmail, // Recipient's email
            subject: 'Your Order has been placed successfully!',
            html: `
                <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; border: 1px solid #ddd; padding: 20px; background-color: #f9f9f9;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <img src="https://res.cloudinary.com/du8ogkcns/image/upload/v1726763193/n5swrlk0apekdvwsc2w5.png" alt="Nexus" style="width: 150px; height: auto;" /> <!-- Replace with your logo URL -->
                    </div>
                    <center>
                    <h2 style="color: #333;">Thank you for your order!</h2>
                    <p style="color: #555;">Dear Customer,</p>
                    <p style="color: #555;">Your order has been successfully placed with the following details:</p>
                    <p><strong>Invoice Number:</strong> ${order.invoiceNumber}</p>
                    <p><strong>Order ID:</strong> ${order._id}</p>
                    <p><strong>Total Amound :</strong> ${order.finalAmount}</p>
                    <h3 style="color: #333;">Products:</h3>
                    ${productDetails}
                    <p style="color: #555;">We will notify you once your order is shipped. If you have any questions, feel free to contact our support team.</p>
                    <p style="color: #555;">Thank you for shopping with <strong>Nexus</strong>!</p>
                    <p style="color: #555;">We hope to serve you again soon.</p>
                    </center>
                    <div style="text-align: center; margin-top: 20px;">
                        <p style="font-size: 12px; color: #999;">&copy; 2024 Nexus. All rights reserved.</p>
                        
                    </div>
                </div>
            `,
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        res.json({
            success: true,
            message: 'Order updated successfully with payment details.',
            orderId: order._id,
            invoiceNumber: order.invoiceNumber, // Send back the invoice number if needed
        });
    } catch (error) {
        console.error('Error updating the order:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};





const cancelOrder = async (req, res) => {
    try {
        // Extract orderId and cancellationReason from the request body
        const { orderId, cancellationReason } = req.body; 

        console.log('Cancelling order with ID:', orderId);
        console.log('Cancellation reason:', cancellationReason);

        // Find the order and update its status, cancellation reason, and cancelledAt field
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            {
                status: 'Cancelled',       // Update the status field
                cancellationReason,        // Update the cancellation reason field
                cancelledAt: new Date()    // Set cancelledAt to the current date
            },
            { new: true, runValidators: true } // Return the updated document
        );

        // Check if the order was found and updated
        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        // Successful response
        res.status(200).json({
            message: 'Order cancelled successfully',
            order: updatedOrder
        });
    } catch (error) {
        console.error('Error cancelling order:', error);
        res.status(500).json({ message: 'Failed to cancel order', error: error.message });
    }
};



module.exports = {
    createOrUpdateOrder,
    getAllOrders,
    updateOrderWithPayment,
    cancelOrder,
};
