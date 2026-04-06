const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://placepro-backend.onrender.com/api/auth/google/callback",
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("🌐 Google OAuth Callback Initiated. Profile ID:", profile.id);

        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.JWT_SECRET) {
             console.error("❌ CRITICAL ERROR: Missing some core environment variables (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET)");
        }

        const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : "";
        const name = profile.displayName;
        const picture = profile.photos && profile.photos.length > 0 ? profile.photos[0].value : "";

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
          // Create new user if doesn't exist
          user = await User.create({
            name,
            email,
            password: "google_oauth_user_" + Math.random().toString(36).slice(-8),
            role: "user",
            picture: picture || ""
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
