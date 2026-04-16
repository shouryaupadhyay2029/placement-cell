const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/User");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV === "production" 
        ? "https://placepro-backend.onrender.com/api/auth/google/callback"
        : "http://localhost:5000/api/auth/google/callback",
      proxy: true,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log("🌐 Google Profile received:", JSON.stringify({ id: profile.id, displayName: profile.displayName, emails: profile.emails }));

        const email = profile.emails?.[0]?.value || null;
        if (!email) {
          console.error("❌ CRITICAL ERROR: Google Auth payload returned without a valid email address.");
          return done(new Error("Missing email from Google profile"), null);
        }

        const name = profile.displayName || "Unknown User";
        const picture = profile.photos?.[0]?.value || "";
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
        console.error("❌ Google Strategy Internal Crash:", error);
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
