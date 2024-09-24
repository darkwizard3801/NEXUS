const User = require('../../models/userModel');

async function updateRoleController(req, res) {
    const { userId, role } = req.body;

    // Check if both userId and role are provided
    if (!userId || !role) {
        return res.status(400).json({
            success: false,
            message: "User ID and role are required."
        });
    }

    try {
        // Find the user by ID and update the role
        const user = await User.findByIdAndUpdate(userId, { role: role }, { new: true });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found."
            });
        }

        return res.status(200).json({
            success: true,
            message: "Role updated successfully.",
            data: user  // Optionally, return the updated user data
        });
    } catch (error) {
        console.error("Error updating role:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating the role."
        });
    }
}

module.exports = updateRoleController;
