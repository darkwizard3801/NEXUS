const Order = require('../../models/orderModel');
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

const createOrUpdateOrder = async (req, res) => {
    try {
        console.log('Received order request:', req.body);

        const { 
            userEmail, 
            userName, 
            address, 
            products, 
            totalPrice, 
            discount, 
            finalAmount,
            deliveryDate,
            status = "Pending"
        } = req.body;

        // Validation
        if (!userEmail || !userName || !address || !products || !deliveryDate) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided"
            });
        }

        // Process products and their additional details
        const processedProducts = products.map(product => {
            const processedProduct = {
                productId: product.productId,
                productName: product.productName,
                quantity: Number(product.quantity),
                price: Number(product.price),
                category: product.category,
                vendor: product.vendor,
                vendorName: product.vendorName
            };

            // Handle catering products (keeping existing code)
            if (product.category.toLowerCase() === 'catering' && product.additionalDetails?.catering) {
                processedProduct.additionalDetails = {
                    catering: {
                        courses: product.additionalDetails.catering.courses.map(course => ({
                            courseName: course.courseName,
                            courseType: course.courseType,
                            menuItems: course.menuItems || [],
                            additionalNotes: course.additionalNotes || '',
                            dietaryRestrictions: course.dietaryRestrictions || []
                        }))
                    }
                };
            }
            
            // Handle rental products with fine calculation
            if (product.category.toLowerCase() === 'rent' && product.additionalDetails?.rental) {
                const rentalDetails = product.additionalDetails.rental;
                processedProduct.additionalDetails = {
                    ...processedProduct.additionalDetails,
                    rental: {
                        variantName: rentalDetails.variantName,
                        variantPrice: Number(rentalDetails.variantPrice),
                        startDate: new Date(rentalDetails.startDate),
                        endDate: new Date(rentalDetails.endDate),
                        totalPrice: Number(rentalDetails.totalPrice),
                        fine: 0, // Initial fine
                        isReturned: false,
                        finePerDay: Number(rentalDetails.finePerDay)
                    }
                };
            }

            return processedProduct;
        });

        // Create new order
        const newOrder = new Order({
            userEmail,
            userName,
            address,
            products: processedProducts,
            totalPrice: Number(totalPrice),
            discount: Number(discount),
            finalAmount: Number(finalAmount),
            deliveryDate: new Date(deliveryDate),
            status
        });

        await newOrder.save();

        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: newOrder
        });

    } catch (error) {
        console.error('Create Order Error:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to create order",
            error: error.message
        });
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

const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        // Validate status
        const validStatuses = ['Pending', 'Accepted', 'Processing', 'Delivered', 'Declined', 'Cancelled','Ordered'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        // Find and update the order
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true } // Return the updated document
        );

        // Check if order exists
        if (!updatedOrder) {
            return res.status(404).json({
                success: false,
                message: 'Order not found'
            });
        }

        // Send success response
        return res.status(200).json({
            success: true,
            message: 'Order status updated successfully',
            data: updatedOrder
        });

    } catch (error) {
        console.error('Error updating order status:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update order status',
            error: error.message
        });
    }
};

// Add a new function to calculate and update fines
const calculateFine = async (orderId) => {
    try {
        const order = await Order.findById(orderId);
        if (!order) return;

        order.products.forEach(product => {
            if (product.category.toLowerCase() === 'rent' && 
                product.additionalDetails?.rental && 
                !product.additionalDetails.rental.isReturned) {
                
                const startDate = new Date(product.additionalDetails.rental.startDate);
                const endDate = new Date(product.additionalDetails.rental.endDate);
                const currentDate = new Date();
                
                // Set fine to 0 by default
                product.additionalDetails.rental.fine = 0;

                // Only calculate fine if current date is past the end date
                if (currentDate > endDate) {
                    // Calculate days late (rounded up to nearest day)
                    const daysLate = Math.ceil((currentDate - endDate) / (1000 * 60 * 60 * 24));
                    
                    // Calculate fine based on quantity and days late
                    const fineAmount = daysLate * product.additionalDetails.rental.finePerDay;
                    
                    // Update the fine amount
                    product.additionalDetails.rental.fine = fineAmount;
                    
                    console.log(`Fine calculated for order ${orderId}:`, {
                        daysLate,
                        finePerDay: product.additionalDetails.rental.finePerDay,
                        totalFine: fineAmount
                    });
                }
            }
        });

        await order.save();
        return order;
    } catch (error) {
        console.error('Error calculating fine:', error);
        throw error;
    }
};

// Update the return handler to follow the same logic
const markRentalAsReturned = async (req, res) => {
    try {
        const { orderId, productId } = req.body;
        
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        const product = order.products.find(p => 
            p._id.toString() === productId && 
            p.category.toLowerCase() === 'rent'
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Rental product not found in order"
            });
        }

        // Mark as returned
        product.additionalDetails.rental.isReturned = true;
        
        // Calculate final fine only if returned after end date
        const endDate = new Date(product.additionalDetails.rental.endDate);
        const returnDate = new Date();
        
        // Set fine to 0 by default
        product.additionalDetails.rental.fine = 0;
        
        // Only calculate fine if return date is past the end date
        if (returnDate > endDate) {
            const daysLate = Math.ceil((returnDate - endDate) / (1000 * 60 * 60 * 24));
            product.additionalDetails.rental.fine = 
                daysLate * product.additionalDetails.rental.finePerDay;
        }

        await order.save();

        return res.status(200).json({
            success: true,
            message: "Rental marked as returned",
            data: {
                fine: product.additionalDetails.rental.fine,
                daysLate: returnDate > endDate ? 
                    Math.ceil((returnDate - endDate) / (1000 * 60 * 60 * 24)) : 0
            }
        });

    } catch (error) {
        console.error('Error marking rental as returned:', error);
        return res.status(500).json({
            success: false,
            message: "Failed to mark rental as returned",
            error: error.message
        });
    }
};

// Update the email sending function
const sendOrderConfirmationEmail = async (orderDetails) => {
    try {
        // Create HTML for products
        const productsHTML = orderDetails.products.map(product => {
            let additionalDetailsHTML = '';
            
            // Handle rental products
            if (product.category.toLowerCase() === 'rent' && product.additionalDetails?.rental) {
                additionalDetailsHTML = `
                    <div style="margin-top: 10px; color: #666;">
                        <p>Variant: ${product.additionalDetails.rental.variantName}</p>
                        <p>Start Date: ${new Date(product.additionalDetails.rental.startDate).toLocaleDateString()}</p>
                        <p>End Date: ${new Date(product.additionalDetails.rental.endDate).toLocaleDateString()}</p>
                    </div>
                `;
            }
            
            // Handle catering products
            if (product.category.toLowerCase() === 'catering' && product.additionalDetails?.catering) {
                const coursesHTML = product.additionalDetails.catering.courses
                    .map(course => `
                        <div style="margin-left: 15px;">
                            <p><strong>${course.courseName}:</strong></p>
                            <p>${course.menuItems.join(', ')}</p>
                        </div>
                    `).join('');
                
                additionalDetailsHTML = `
                    <div style="margin-top: 10px; color: #666;">
                        <p><strong>Menu Details:</strong></p>
                        ${coursesHTML}
                    </div>
                `;
            }

            return `
                <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
                    <div style="display: flex; align-items: start;">
                        <img src="${product.image}" 
                             alt="${product.productName}" 
                             style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px; margin-right: 15px;"
                        />
                        <div>
                            <h3 style="margin: 0; color: #333;">${product.productName}</h3>
                            <p style="color: #666; margin: 5px 0;">Category: ${product.category}</p>
                            <p style="color: #666; margin: 5px 0;">Quantity: ${product.quantity}</p>
                            <p style="color: #2563eb; margin: 5px 0;">Price: ₹${product.price}</p>
                            ${additionalDetailsHTML}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        const emailHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .order-details { margin-bottom: 30px; }
                    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="color: #2563eb;">Order Confirmation</h1>
                        <p>Thank you for your order!</p>
                    </div>
                    
                    <div class="order-details">
                        <h2>Order Details</h2>
                        <p><strong>Order ID:</strong> ${orderDetails._id}</p>
                        <p><strong>Name:</strong> ${orderDetails.userName}</p>
                        <p><strong>Delivery Address:</strong> ${orderDetails.address}</p>
                        <p><strong>Delivery Date:</strong> ${new Date(orderDetails.deliveryDate).toLocaleDateString()}</p>
                    </div>

                    <div class="products">
                        <h2>Ordered Products</h2>
                        ${productsHTML}
                    </div>

                    <div class="price-summary" style="margin-top: 20px; padding: 15px; background-color: #f8fafc; border-radius: 8px;">
                        <p><strong>Total Price:</strong> ₹${orderDetails.totalPrice}</p>
                        <p><strong>Discount:</strong> ₹${orderDetails.discount}</p>
                        <p style="font-size: 1.2em; color: #2563eb;"><strong>Final Amount:</strong> ₹${orderDetails.finalAmount}</p>
                    </div>

                    <div class="footer">
                        <p>If you have any questions, please contact our support team.</p>
                        <p style="color: #666;">Thank you for choosing our service!</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Send email using your email service
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: orderDetails.userEmail,
            subject: `Order Confirmation - Order #${orderDetails._id}`,
            html: emailHTML
        };

        await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent successfully');

    } catch (error) {
        console.error('Error sending order confirmation email:', error);
        throw error;
    }
};

module.exports = {
    createOrUpdateOrder,
    getAllOrders,
    updateOrderWithPayment,
    cancelOrder,
    updateOrderStatus,
    calculateFine,
    markRentalAsReturned,
    sendOrderConfirmationEmail
};
