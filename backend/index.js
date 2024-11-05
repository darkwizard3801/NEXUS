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

// Add this at the start of your file to verify environment variables
const requiredEnvVars = [
    'TOKEN_SECRET_KEY',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'FRONTEND_URL'
];

requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
        console.error(`Missing required environment variable: ${varName}`);
        process.exit(1);
    }
});

// Log configuration
console.log('Environment:', process.env.NODE_ENV);
console.log('Frontend URL:', process.env.FRONTEND_URL);
console.log('Token Secret Key exists:', !!process.env.TOKEN_SECRET_KEY);

// Middleware setup
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(cors({
    origin: true,
    credentials: true
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

// Add Cloudflare and security headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'production' ? {} : err
    });
});

// Add health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Passport configuration for Google strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: 'https://nexus-q4sy.onrender.com/auth/google/callback',
    proxy: true
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('Google profile received:', profile);
        let user = await User.findOne({ email: profile.emails[0].value });
        
        if (!user) {
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
        
        return done(null, user);
    } catch (error) {
        console.error('Error in Google Strategy:', error);
        return done(error, null);
    }
}));

// Passport configuration for Facebook strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ facebookId: profile.id });
        if (!user) {
            // Create new user if not found
            user = new User({ 
                facebookId: profile.id, 
                name: profile.displayName, 
                email: profile.emails[0].value,
                isOAuth: true // Indicate that this user authenticated via OAuth
            });
            await user.save(); // Save the new user to the database
        }
        done(null, user);
    } catch (error) {
        done(error, null);
    }
}));

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
app.get('/auth/google', 
    passport.authenticate('google', { 
        scope: ['profile', 'email'] 
    })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/login',
        session: false 
    }),
    async (req, res) => {
        try {
            console.log('Callback received, processing user data');
            const user = req.user;
            
            if (!user) {
                console.error('No user data found in request');
                return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
            }

            // Create token data
            const tokenData = {
                _id: user._id.toString(), // Convert ObjectId to string
                email: user.email,
                role: user.role,
                name: user.name,
                profilePic: user.profilePic
            };

            console.log('Token data being signed:', tokenData); // Debug log

            // Generate token
            const token = jwt.sign(
                tokenData,
                process.env.TOKEN_SECRET_KEY,
                { expiresIn: '90d' }
            );

            console.log('Generated token:', token); // Debug log

            // Set cookie options
            const cookieOptions = {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
                maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
                path: '/'
            };

            // Set the cookie
            res.cookie('token', token, cookieOptions);

            // Determine redirect URL based on role
            let redirectUrl;
            if (!user.role) {
                redirectUrl = `${process.env.FRONTEND_URL}/select-role?token=${token}&userId=${user._id}`;
            } else {
                const basePath = user.role === "Vendor" ? '/vendor-page' : '/';
                redirectUrl = `${process.env.FRONTEND_URL}${basePath}?token=${token}`;
            }

            console.log('Redirecting to:', redirectUrl); // Debug log
            return res.redirect(redirectUrl);

        } catch (error) {
            console.error('Error in callback:', error);
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
        }
    }
);

// Routes for Facebook authentication
// app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// Facebook callback
// app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), async (req, res) => {
//     try {
//         const user = await User.findById(req.user.id);
        
//         const tokenData = {
//             _id: user._id,
//             email: user.email,
//             role: user.role
//         };
        
//         const token = jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, { expiresIn: '90d' });

//         const tokenOptions = {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === 'production',
//             sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
//             maxAge: 90 * 24 * 60 * 60 * 1000,
//             path: '/'
//         };

//         res.cookie("token", token, tokenOptions);

//         const redirectUrl = user.role === "Vendor" 
//             ? `${process.env.FRONTEND_URL}/vendor-page` 
//             : user.role === "Customer" 
//             ? `${process.env.FRONTEND_URL}/` 
//             : `${process.env.FRONTEND_URL}/select-role?userId=${req.user.id}`;

//         res.redirect(redirectUrl);
//     } catch (error) {
//         console.error("Error during Facebook login callback:", error);
//         res.redirect(`${process.env.FRONTEND_URL}/login`);
//     }
// });

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