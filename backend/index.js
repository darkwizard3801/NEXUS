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
    proxy: true
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ 
            $or: [
                { googleId: profile.id },
                { email: profile.emails[0].value }
            ]
        });

        if (!user) {
            user = await User.create({ 
                googleId: profile.id, 
                name: profile.displayName, 
                email: profile.emails[0].value,
                profilePic: profile.photos[0].value,
                isOAuth: true
            });
        } else if (!user.googleId) {
            return done(null, false, { message: "Email exists with different login method" });
        }

        return done(null, user);
    } catch (error) {
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

// Google callback route with timeout handling
app.get('/auth/google/callback', 
    (req, res, next) => {
        // Set a timeout for the authentication process
        const timeoutDuration = 25000; // 25 seconds
        const timeout = setTimeout(() => {
            console.error('Authentication timeout');
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=Authentication timeout`);
        }, timeoutDuration);

        // Store timeout in request object to clear it later
        req.authTimeout = timeout;
        next();
    },
    passport.authenticate('google', { 
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=Authentication failed`
    }),
    async (req, res) => {
        // Clear the timeout since authentication succeeded
        clearTimeout(req.authTimeout);

        try {
            const user = req.user;
            
            // Generate token immediately
            const token = jwt.sign({
                _id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }, process.env.TOKEN_SECRET_KEY, { expiresIn: '90d' });

            // Set cookie with minimal options
            res.cookie("token", token, {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 90 * 24 * 60 * 60 * 1000
            });

            // Redirect immediately
            const redirectUrl = !user.role 
                ? `${process.env.FRONTEND_URL}/select-role?userId=${user._id}`
                : `${process.env.FRONTEND_URL}/`;

            return res.redirect(redirectUrl);

        } catch (error) {
            console.error("Callback Error:", error);
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=Server error`);
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