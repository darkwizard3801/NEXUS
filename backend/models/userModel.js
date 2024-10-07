const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // Ensure bcrypt is imported

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    sparse: true,
  },
  password: {
    type: String,
    required: function () {
      return this.isOAuth !== true; // Only require password if not using OAuth
    },
  },
  profilePic: {
    type: String,
    default: '', // Set default to empty string
  },
  role: {
    type: String,
    default: 'customer',
    // enum: ['customer', 'vendor', 'admin'], // Uncomment if needed
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  facebookId: {
    type: String,
    unique: true,
    sparse: true,
  },
  isOAuth: {
    type: Boolean,
    default: false // By default, users are not OAuth users
},
  isVerified: {
    type: Boolean,
    default: false,
  },
  phoneNumber: {
    type: String,
    // required: true, // Uncomment if this is required
  },
  additionalPhoneNumber: {
    type: String,
    default: '', // Optional, can be left blank
  },
  houseFlat: {
    type: String, // House or flat number
    // required: true, // Uncomment if required
  },
  street: {
    type: String,
    // required: true, // Uncomment if required
  },
  postOffice: {
    type: String,
    // required: true, // Uncomment if required
  },
  district: {
    type: String,
    // required: true, // Uncomment if required
  },
  state: {
    type: String,
    // required: true, // Uncomment if required
  },
  zipCode: {
    type: String,
    // required: true, // Uncomment if required
  },
  resetOtp: {
    type: String, // Field to store the OTP
     // Do not select OTP by default
},
resetOtpExpire: {
    type: Date // Field to store the expiration time of the OTP
},
address:
{
  type: [String],  // Array of strings
  default: [],  // Default value is an empty array
},
    // required: true, // Uncomment if required

  
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (this.isModified('password') && !this.isOAuth) {
    console.log("Password before hashing:", this.password); // Log before hashing
    this.password = await bcrypt.hash(this.password, 10); // Hash password with bcrypt
    console.log("Password after hashing:", this.password); // Log after hashing
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
