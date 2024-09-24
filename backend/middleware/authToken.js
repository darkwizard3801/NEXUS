
const jwt = require('jsonwebtoken');

async function authToken(req, res, next) {
    try {
        const token = req.cookies?.token;

        console.log("token      -", token);
        if (!token) {
            return res.status(401).json({
                message: "Please Login...!",
                error: true,
                success: false,
            });
        }

        jwt.verify(token, process.env.TOKEN_SECRET_KEY, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ // 401 for expired token
                        message: "Token has expired, please log in again.",
                        error: true,
                        success: false,
                    });
                }
                console.log("Error verifying token:", err);
                return res.status(403).json({ // 403 for invalid token
                    message: "Invalid token",
                    error: true,
                    success: false,
                });
            }

            // Attach user ID to request object
            req.userId = decoded?._id;

            // Proceed to the next middleware
            next();
        });

    } catch (err) {
        console.error("Error in authToken middleware:", err.message || err);
        res.status(500).json({
            message: "An error occurred during authentication",
            error: true,
            success: false,
        });
    }
}

module.exports = authToken;
