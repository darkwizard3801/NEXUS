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
    callbackURL: `${process.env.BACKEND_URL}/auth/google/callback`,
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log("\n=== Google Auth Debug ===");
        console.log("Incoming Google Profile:", {
            id: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName
        });

        // Clear any existing sessions
        // First, try to find user by googleId
        let user = await User.findOne({ googleId: profile.id });
        console.log("Search by googleId result:", user);
        
        // If no user found by googleId, check by email
        if (!user) {
            user = await User.findOne({ email: profile.emails[0].value });
            console.log("Search by email result:", user);
            
            if (user) {
                console.log("ERROR: Email exists but with different auth method");
                return done(null, false, { 
                    message: "This email is already registered using a different method. Please use your original login method." 
                });
            }
            
            // Create new user
            const newUser = new User({ 
                googleId: profile.id, 
                name: profile.displayName, 
                email: profile.emails[0].value,
                profilePic: profile.photos[0].value,
                isOAuth: true,
                role: null
            });

            user = await newUser.save();
            console.log("New user created:", user);
        }

        // Verify the user object
        if (!user.googleId) {
            console.log("ERROR: User found but no googleId");
            return done(null, false, { 
                message: "Account exists with different login method" 
            });
        }

        // Verify the googleId matches
        if (user.googleId !== profile.id) {
            console.log("ERROR: GoogleId mismatch");
            return done(null, false, { 
                message: "Authentication method mismatch" 
            });
        }

        console.log("Authentication successful for user:", user.email);
        console.log("=== End Google Auth Debug ===\n");
        
        return done(null, user);
    } catch (error) {
        console.error("Google Strategy Error:", error);
        return done(error, null);
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
    passport.authenticate('google', { session: false }),
    async (req, res) => {
        try {
            console.log("User authenticated:", req.user);
            
            // Clear any existing cookies
            res.clearCookie('token');
            
            const tokenData = {
                _id: req.user._id,
                email: req.user.email,
                name: req.user.name,  // Include name in token data
                role: req.user.role,
                profilePic: req.user.profilePic  // Include profile picture if needed
            };

            const token = jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, { expiresIn: '90d' });
            
            const tokenOption = {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 90 * 24 * 60 * 60 * 1000
            };

            res.cookie("token", token, tokenOption);
            console.log("Token Data:", tokenData);
            console.log("Cookie Set:", token);

            // Determine redirect URL
            const redirectUrl = !req.user.role 
                ? `${process.env.FRONTEND_URL}/select-role?userId=${req.user._id}`
                : req.user.role === "Vendor"
                    ? `${process.env.FRONTEND_URL}/vendor-page`
                    : `${process.env.FRONTEND_URL}/`;

            console.log("Redirecting to:", redirectUrl);
            console.log("=== End Google Callback Debug ===\n");
            
            return res.redirect(redirectUrl);
        } catch (error) {
            console.error("Callback Error:", error);
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=Something went wrong`);
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