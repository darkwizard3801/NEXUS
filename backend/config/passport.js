const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User'); // Adjust the path based on your structure

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback" // Adjust the callback URL if needed
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists in the database
      let user = await User.findOne({ googleId: profile.id });
      
      if (!user) {
        // Create a new user if one doesn't exist
        user = new User({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          role: null, // No role assigned yet
        });
        await user.save();
        return done(null, user, { isNewUser: true });
      }

      // User exists
      return done(null, user, { isNewUser: false });

    } catch (err) {
      return done(err, null);
    }
  }
));

// Serialize user to the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport; // Export the configured passport instance
