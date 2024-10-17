const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true,
    },
    userName: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    products: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            productName: {
                type: String,
                required: true,
            },
            
            quantity: {
                type: Number,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            vendor: {
                type: String,
                required: true,
            },
            image: {
                type: String,
                required: true,
            },
            vendorName: {
                type: String,
                required: true,
            },
        },
    ],
    totalPrice: {
        type: Number,
        required: true,
    },
    discount: {
        type: Number,
        required: true,
    },
    finalAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        default: 'Pending', // Possible values: 'Pending', 'Ordered', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'
    },
    paymentId: {
        type: String,
        required: false, // Optional, can be set after payment is made
    },
    invoicePath: {
        type: String,
        required: false, // Optional, can be set after invoice generation
    },
    invoiceNumber:{
        type: String,
    },
    deliveryDate:{
        type: Date,
    },
    cancellationReason:{
        type: String,
    },
    cancelledAt:{
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Order', orderSchema);
