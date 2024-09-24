const userModel = require("../../models/userModel");

async function userDetailsController(req, res) {
    try {
        console.log("userId", req.userId);
        const user = await userModel.findById(req.userId);
       
        
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                error: true,
                success: false,
            });
        }

        res.status(200).json({
            data: user,
            error: false,
            success: true,
            message: "User details",
        });

        console.log("user", user);
    } catch (err) {
        console.error("Error fetching user details:", err); // Log the error
        res.status(500).json({
            message: "An error occurred while fetching user details",
            error: true,
            success: false,
        });
    }
}

module.exports = userDetailsController;
