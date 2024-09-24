const User = require('../../models/userModel'); // Assuming your user model is named userModel
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

// Helper function to generate a random OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Transporter for sending emails using nodemailer
const transporter = nodemailer.createTransport({
    service: 'Gmail', // or any other email service
    auth: {
        user: process.env.EMAIL, // Email from which OTP will be sent
        pass: process.env.EMAIL_PASSWORD, // Password of that email account
    },
});

// Controller for Forgot Password (Send OTP)
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: 'No user associated with this email' });
        }

        // Generate OTP and store in the database
        const otp = generateOTP();
        user.resetOtp = otp;
        user.resetOtpExpire = Date.now() + 15 * 60 * 1000; // OTP valid for 15 minutes
        await user.save();

        // Send OTP email
        const mailOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px; text-align: center;">
                    <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                        <img src="https://res.cloudinary.com/du8ogkcns/image/upload/v1726763193/n5swrlk0apekdvwsc2w5.png" alt="Nexus Logo" width: 250px height: 200px style="margin-bottom: 20px;"/>
                        <h2 style="color: #333;">Password Reset Request</h2>
                        <p>Hello,</p>
                        <p>We received a request to reset your password. Please use the following One-Time Password (OTP) to reset your password:</p>
                        <p>OTP</p>
                        <p style="font-size: 18px; font-weight: bold; color: #e74c3c;"> ${otp}</p>
                        <p>This OTP is valid for 15 minutes. If you did not request a password reset, please ignore this email.</p>
                        <p>Thank you,</p>
                        <p>Nexus Team</p>
                    </div>
                </div>
            `,
        };
        
        

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ success: true, message: 'OTP has been sent to your email' });
    } catch (error) {
        console.error('Error in forgotPassword:', error);
        return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
    }
};

// Controller for Verify OTP
exports.verifyOtp = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });

        console.log('User found:', user);
        console.log('Provided OTP:', otp);
        console.log('Stored OTP:', user.resetOtp);
        console.log('OTP Expiration:', user.resetOtpExpire);
        console.log('Current Time:', Date.now());

        if (!user || user.resetOtp !== otp || Date.now() > user.resetOtpExpire) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        return res.status(200).json({ success: true, message: 'OTP verified. You can reset your password now.' });
    } catch (error) {
        console.error('Error in verifyOtp:', error);
        return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
    }
};

// Controller for Reset Password
exports.resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            console.log('User not found');
            return res.status(400).json({ success: false, message: 'User not found' });
        }

        console.log('Received OTP:', otp);
        console.log('Stored OTP:', user.resetOtp);
        console.log('Current Time:', Date.now());
        console.log('OTP Expiry Time:', user.resetOtpExpire);

        // if (user.resetOtp !== otp || Date.now() > user.resetOtpExpire) {
        //     return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        // }

        // Hash new password and save it
        const salt = await bcrypt.genSalt(10);
        user.password = newPassword;
        user.resetOtp = undefined; // Clear OTP after successful password reset
        user.resetOtpExpire = undefined; // Clear OTP expiry
        await user.save();

        return res.status(200).json({ success: true, message: 'Password has been reset successfully.' });
    } catch (error) {
        console.error('Error in resetPassword:', error);
        return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
    }
};


// In your forgotPassword.js controller

// Controller for Resend OTP
exports.resendOtp = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'No user associated with this email' });
        }

        // Generate a new OTP and update the user
        const otp = generateOTP();
        user.resetOtp = otp;
        user.resetOtpExpire = Date.now() + 15 * 60 * 1000; // OTP valid for 15 minutes
        await user.save();

        // Send OTP email
        const mailOptions = {
            from: process.env.EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            html: `
                <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 40px; text-align: center;">
                    <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; padding: 20px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);">
                        <img src="https://res.cloudinary.com/du8ogkcns/image/upload/v1726763193/n5swrlk0apekdvwsc2w5.png" alt="Nexus Logo" style="width: 100px; height: auto; margin-bottom: 20px;"/>
                        <h2 style="color: #333;">Password Reset Request</h2>
                        <p>Hello,</p>
                        <p>We received a request to reset your password. Please use the following One-Time Password (OTP) to reset your password:</p>
                        <p>OTP</p>
                        <p style="font-size: 18px; font-weight: bold; color: #e74c3c;"> ${otp}</p>
                        <p>This OTP is valid for 15 minutes. If you did not request a password reset, please ignore this email.</p>
                        <p>Thank you,</p>
                        <p>Nexus Team</p>
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ success: true, message: 'OTP has been resent to your email' });
    } catch (error) {
        console.error('Error in resendOtp:', error);
        return res.status(500).json({ success: false, message: 'An error occurred. Please try again.' });
    }
};

