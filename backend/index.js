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
    origin: [
        process.env.FRONTEND_URL,
        'https://nexus-q4sy.onrender.com',
        'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
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
    // Allow Cloudflare
    res.header('Access-Control-Allow-Origin', process.env.FRONTEND_URL);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
    
    // Security headers
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    
    // Handle OPTIONS method
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
    callbackURL: process.env.NODE_ENV === 'production' 
        ? 'https://nexus-q4sy.onrender.com/auth/google/callback'
        : 'http://localhost:8080/auth/google/callback',
    proxy: true,
    timeout: 20000,
    trustProxy: true
}, async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('Google authentication successful, profile:', profile); // Debug log
        
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
            console.log('New user created:', user); // Debug log
        } else {
            console.log('Existing user found:', user); // Debug log
        }
        done(null, user);
    } catch (error) {
        console.error('Error in Google Strategy:', error);
        done(error, null);
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
    (req, res, next) => {
        console.log('Starting Google authentication'); // Debug log
        next();
    },
    passport.authenticate('google', { 
        scope: ['profile', 'email'],
        prompt: 'select_account'
    })
);

// Google callback
app.get('/auth/google/callback', 
    (req, res, next) => {
        console.log('Received callback from Google'); // Debug log
        next();
    },
    passport.authenticate('google', { 
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`
    }), 
    async (req, res) => {
        try {
            console.log('Authentication successful, processing callback');
            
            const user = req.user;
            if (!user) {
                console.error('No user data in request');
                return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
            }

            const tokenData = {
                _id: user._id,
                email: user.email,
                role: user.role,
                name: user.name,
                profilePic: user.profilePic
            };

            const token = jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, { expiresIn: '90d' });

            const tokenOptions = {
                httpOnly: true,
                secure: true, // Always true for production
                sameSite: 'none',
                maxAge: 90 * 24 * 60 * 60 * 1000,
                path: '/'
            };

            res.cookie("token", token, tokenOptions);

            // Determine redirect URL
            const redirectUrl = !user.role 
                ? `${process.env.FRONTEND_URL}/select-role?userId=${user._id}&token=${token}`
                : `${process.env.FRONTEND_URL}${user.role === "Vendor" ? '/vendor-page' : '/'}?loginSuccess=true&token=${token}`;

            console.log('Redirecting to:', redirectUrl);
            return res.redirect(redirectUrl);
        } catch (error) {
            console.error('Error in callback handler:', error);
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
        }
    }
);

// Routes for Facebook authentication
app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// Facebook callback
app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        
        const tokenData = {
            _id: user._id,
            email: user.email,
            role: user.role
        };
        
        const token = jwt.sign(tokenData, process.env.TOKEN_SECRET_KEY, { expiresIn: '90d' });

        const tokenOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge: 90 * 24 * 60 * 60 * 1000,
            path: '/'
        };

        res.cookie("token", token, tokenOptions);

        const redirectUrl = user.role === "Vendor" 
            ? `${process.env.FRONTEND_URL}/vendor-page` 
            : user.role === "Customer" 
            ? `${process.env.FRONTEND_URL}/` 
            : `${process.env.FRONTEND_URL}/select-role?userId=${req.user.id}`;

        res.redirect(redirectUrl);
    } catch (error) {
        console.error("Error during Facebook login callback:", error);
        res.redirect(`${process.env.FRONTEND_URL}/login`);
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