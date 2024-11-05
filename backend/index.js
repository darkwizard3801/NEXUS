const express = require('express');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./models/userModel'); // Import User model
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const jwt = require('jsonwebtoken');
const connectDB = require('./config/db');
const router = require('./routes');

const app = express();


// Middleware setup
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? ['https://nexus-q4sy.onrender.com', 'https://nexus-b9xa.onrender.com']
        : 'http://localhost:3000',
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS", "PUT"],
}));

app.use(express.json());
app.use(cookieParser());
app.use(session({ 
    secret: process.env.TOKEN_SECRET_KEY, 
    resave: false, 
    saveUninitialized: true 
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport configuration for Google strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`, // Use full URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log("Google Strategy - Profile received:", profile.emails[0].value);
        // First, try to find user by googleId
        let user = await User.findOne({ googleId: profile.id });
        
        // If no user found by googleId, check by email
        if (!user) {
            user = await User.findOne({ email: profile.emails[0].value });
            
            // If user exists with email but no googleId, it's a different auth method
            if (user) {
                console.log("User exists with different auth method");
                return done(null, false, { message: "Email already exists with different login method" });
            }
            
            // Create new user if neither googleId nor email exists
            console.log("Creating new user for:", profile.emails[0].value);
            user = new User({ 
                googleId: profile.id, 
                name: profile.displayName, 
                email: profile.emails[0].value,
                profilePic: profile.photos[0].value,
                isOAuth: true,
                role: null
            });
            await user.save();
        }
        
        console.log("User object:", user);
        done(null, user);
    } catch (error) {
        console.error("Error in Google Strategy:", error);
        done(error, null);
    }
}));

// Passport configuration for Facebook strategy
// passport.use(new FacebookStrategy({
//     clientID: process.env.FACEBOOK_APP_ID,
//     clientSecret: process.env.FACEBOOK_APP_SECRET,
//     callbackURL: '/auth/facebook/callback',
//     profileFields: ['id', 'displayName', 'email']
// }, async (accessToken, refreshToken, profile, done) => {
//     try {
//         let user = await User.findOne({ facebookId: profile.id });
//         if (!user) {
//             // Create new user if not found
//             user = new User({ 
//                 facebookId: profile.id, 
//                 name: profile.displayName, 
//                 email: profile.emails[0].value,
//                 isOAuth: true // Indicate that this user authenticated via OAuth
//             });
//             await user.save(); // Save the new user to the database
//         }
//         done(null, user);
//     } catch (error) {
//         done(error, null);
//     }
// }));

passport.serializeUser((user, done) => {
    done(null, user.id); // Serialize user ID
});

passport.deserializeUser((id, done) => {
    User.findById(id)
        .then(user => {
            done(null, user); // Deserialize user object
        });
});

// Routes for Google authentication
app.get('/auth/google', (req, res, next) => {
    console.log("Starting Google authentication");
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        prompt: 'select_account' // Add this to force Google account selection
    })(req, res, next);
});

// Google callback
app.get('/auth/google/callback', 
    passport.authenticate('google', { 
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=Email already exists with different login method`
    }),
    async (req, res) => {
        try {
            console.log("Processing Google callback");
            const user = req.user; // User is attached to the request
            console.log("User from request:", user);

            const tokenData = {
                _id: user._id,
                email: user.email,
                role: user.role // Include role in token data for redirection later
            };

            const token = jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, { expiresIn: '90d' });
            console.log("JWT Token generated");

            // Set cookie options
            const tokenOption = {
                httpOnly: true,
                secure: true, // Always true for production
                sameSite: 'none', // Important for cross-site cookies
                maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
                domain: process.env.NODE_ENV === 'production' ? 'https://nexus-b9xa.onrender.com/' : 'http://localhost:3000', // Update with your domain
            };
            console.log(token);
            console.log(tokenOption);
            // Send token as a cookie
            res.cookie("token", token, tokenOption);
            console.log("Cookie set:", { name: "token", value: token });

            // Check if the user is new or already has a role
            if (!user.role) {
                // Redirect to select-role if the user is new
                res.redirect(`${process.env.FRONTEND_URL}/select-role?userId=${user._id}`);
            } else {
                // Redirect based on role
                const redirectUrl = user.role === "Vendor" 
                    ? `${process.env.FRONTEND_URL}/vendor-page` 
                    : user.role === "Customer" 
                    ? `${process.env.FRONTEND_URL}/` 
                    : user.role === "Admin" 
                    ? `${process.env.FRONTEND_URL}/` 
                    : `${process.env.FRONTEND_URL}/select-role?userId=${user._id}`; // Default redirect

                res.redirect(redirectUrl); // Redirect to appropriate page
            }
        } catch (error) {
            console.error("Detailed error in callback:", error);
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=${encodeURIComponent(error.message)}`);
        }
    }
);

// Routes for Facebook authentication
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// Facebook callback
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), async (req, res) => {
    try {
        const user = await User.findById(req.user.id); // Fetch user details
        const redirectUrl = user.role === "Vendor" 
            ? `${process.env.FRONTEND_URL}/vendor-page` 
            : user.role === "Customer" 
            ? `${process.env.FRONTEND_URL}/` 
            : `${process.env.FRONTEND_URL}/select-role?userId=${req.user.id}`; // Redirect to select-role if new

        res.redirect(redirectUrl); // Redirect to appropriate page
    } catch (error) {
        console.error("Error during Facebook login callback:", error);
        res.redirect('/login'); // Fallback redirect
    }
});

// API endpoint to update user's role
app.post('/api/update-role', async (req, res) => {
    const { userId, role } = req.body;

    // Validate request body
    if (!userId || !role) {
        return res.status(400).json({ success: false, message: "User ID and role are required." });
    }

    try {
        // Update the user's role in the database
        const updatedUser = await User.findByIdAndUpdate(userId, { role: role }, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: "User not found." });
        }

        res.status(200).json({ success: true, message: "Role updated successfully.", user: updatedUser });
    } catch (error) {
        console.error("Error updating role:", error);
        res.status(500).json({ success: false, message: "Error updating role." });
    }
});

// Initialize routes
app.use("/api", router);

// Start server and connect to database
const PORT = process.env.PORT || 8080;

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Connected to DB");
        console.log("Server is running on port " + PORT);
    });
});