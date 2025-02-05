const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    courseName: {
        type: String,
        required: true
    },
    courseType: {
        type: String,
        required: true
    },
    dishes: [{
        type: String,
        required: true
    }],
    additionalNotes: {
        type: String,
        default: ''
    }
});

const cateringSchema = new mongoose.Schema({
    courseType: {
        type: String,
        enum: ['3', '5', '7', '10'],
        required: true
    },
    courses: [courseSchema]
});

const productSchema = mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    brandName: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    productImage: {
        type: [String],
        default: []
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    disabled: { 
        type: Boolean, 
        default: false 
    },
    sponsor: {
        type: Boolean, 
        default: false 
    },
    catering: {
        type: cateringSchema,
        required: function() {
            return this.category === 'Catering';
        }
    }
}, {
    timestamps: true
});

const productModel = mongoose.model("product", productSchema);

module.exports = productModel;
