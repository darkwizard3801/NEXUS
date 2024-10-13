const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    productName: String,
    brandName: String,
    category: String,
    productImage: [],
    description: String,
    price: Number,
    user: String,
    disabled: { type: Boolean, default: false },
    sponsor: {type: Boolean, default: false },
}, {
    timestamps: true
});

const productModel = mongoose.model("product", productSchema);

module.exports = productModel;
