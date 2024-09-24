const userModel = require("../../models/userModel");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL, // your email
    pass: process.env.EMAIL_PASSWORD, // your email password or app-specific password
  },
  secure: true,
  debug: true,
});
console.log('Email:', process.env.EMAIL);
console.log('Password:', process.env.EMAIL_PASSWORD);
// Verify transporter
transporter.verify((error, success) => {
  if (error) {
    console.log('Error with transporter:', error);
  } else {
    console.log('Transporter is ready to send emails:', success);
  }
});

// Function to send verification email
const sendVerificationEmail = async (user) => {
  const token = jwt.sign({ id: user._id }, process.env.TOKEN_SECRET_KEY, { expiresIn: '1h' });
  const verificationLink = `http://localhost:8080/api/verify-email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL,
    to: user.email,
    subject: 'Verify your email address',
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
        <img src="https://res.cloudinary.com/du8ogkcns/image/upload/v1726763193/n5swrlk0apekdvwsc2w5.png" alt="Nexus Logo" style="max-width: 100px; margin-bottom: 20px;">
        <h2>Email Verification</h2>
        <p>Thank you for choosing Nexus! We're excited to have you on board.</p>
        <p>Please click the button below to verify your email address:</p>
        <a href="${verificationLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not create an account, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully.');
  } catch (error) {
    console.error('Error sending verification email:', error.response ? error.response : error);
    throw new Error("Failed to send verification email");
  }
};


async function userSignUpController(req, res) {
  try {
    // Destructure and trim input fields
    let { email, password, name, role } = req.body;
    email = email?.trim().toLowerCase();
    password = password?.trim();

    // Check if the user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists.",
        error: true,
        success: false,
      });
    }

    // Validate input fields
    if (!email) {
      return res.status(400).json({ message: "Please provide email.", error: true, success: false });
    }
    if (!password) {
      return res.status(400).json({ message: "Please provide password.", error: true, success: false });
    }
    if (!name) {
      return res.status(400).json({ message: "Please provide name.", error: true, success: false });
    }
    if (!role) {
      return res.status(400).json({ message: "Please provide a valid role.", error: true, success: false });
    }

    // Hash the password
    // const salt = await bcrypt.genSalt(10);
    // const hashPassword = await bcrypt.hash(password, salt);

    // Create a new user object with `isVerified` set to false
    const payload = {
      ...req.body,
      isVerified: false, // Email verification status
    };

    const userData = new userModel(payload);
    const saveUser = await userData.save();

    // Send verification email
    await sendVerificationEmail(saveUser);

    // Respond with success message
    res.status(201).json({
      data: saveUser,
      success: true,
      error: false,
      message: "User created successfully! A verification email has been sent.",
    });

  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({
      message: err.message || "An error occurred during signup.",
      error: true,
      success: false,
    });
  }
}

module.exports = userSignUpController;
