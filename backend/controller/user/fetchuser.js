const User = require('../../models/userModel'); // Adjust the path as needed

// Controller to fetch user details by email
exports.getUserByEmail = async (req, res) => {
    const { email } = req.params;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Exclude sensitive information like password and OTP
        const { password, resetOtp, resetOtpExpire, ...userDetails } = user.toObject();

        return res.status(200).json({ success: true, user: userDetails });
    } catch (error) {
        console.error('Error fetching user details:', error);
        return res.status(500).json({ success: false, message: 'An error occurred while fetching user details' });
    }
};
