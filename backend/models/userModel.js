
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        select: false, // Do not select password by default
        required: function () {
            return !this.isOAuth; // Password is required only if not OAuth user
        }
    },
    profilePic: String,
    role: {
        type: String,
        enum: ['Customer', 'Vendor', 'Admin'],
        default: 'Customer' // Default role is Customer
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allows other unique fields to exist
    },
    facebookId: {
        type: String,
        unique: true,
        sparse: true // Allows other unique fields to exist
    },
    isOAuth: {
        type: Boolean,
        default: false // By default, users are not OAuth users
    },
    isVerified: {
        type: Boolean,
        default: false // Default is not verified
    },
    resetOtp: {
        type: String, // Field to store the OTP
         // Do not select OTP by default
    },
    resetOtpExpire: {
        type: Date // Field to store the expiration time of the OTP
    }
}, {
    timestamps: true // Automatically manage createdAt and updatedAt fields
});

// Hash the password before saving to the database
userSchema.pre('save', async function (next) {
    if (this.isModified('password') && !this.isOAuth) {
        console.log("Password before hashing:", this.password); // Log before hashing
        this.password = await bcrypt.hash(this.password, 10); // Hash password with bcrypt
        console.log("Password after hashing:", this.password); // Log after hashing
    }
    next();
});



const userModel = mongoose.model("User", userSchema);

module.exports = userModel;
