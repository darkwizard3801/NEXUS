const jwt = require('jsonwebtoken');
const userModel = require("../../models/userModel");

async function verifyEmailController(req, res) {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ message: "No token provided.", success: false });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET_KEY);

        // Find the user by ID
        const user = await userModel.findById(decoded.id);
        if (!user) {
            return res.status(404).json({ message: "User not found.", success: false });
        }

        // Update the user's isVerified field
        user.isVerified = true;
        await user.save();

        // Redirect to the login page
        res.redirect('http://localhost:3000/login');
    } catch (error) {
        console.error("Verification error:", error);
        res.status(500).json({ message: "Failed to verify email.", success: false });
    }
}

module.exports = verifyEmailController;
