const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

/**
 * JWT Generation
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

/**
 * @desc    Auth with Google
 * @route   GET /auth/google
 */
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

/**
 * @desc    Google auth callback
 * @route   GET /auth/google/callback
 */
router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", (err, user, info) => {
      try {
        if (err) {
          console.error("❌ Passport Auth Error:", err);
          return res.redirect("https://placement-cell-chi.vercel.app/index.html?error=google_login_failed");
        }
        
        if (!user) {
          console.error("❌ Passport Callback: No user object returned by strategy.");
          return res.redirect("https://placement-cell-chi.vercel.app/index.html?error=google_user_missing");
        }

        req.logIn(user, (loginErr) => {
          if (loginErr) {
            console.error("❌ Session logIn Error:", loginErr);
            return res.redirect("https://placement-cell-chi.vercel.app/index.html?error=session_creation_failed");
          }
          
          if (!process.env.JWT_SECRET) {
            console.error("❌ CRITICAL: JWT_SECRET environment variable is missing.");
            return res.redirect("https://placement-cell-chi.vercel.app/index.html?error=server_config_error");
          }

          // Successful authentication
          console.log(`✅ Google OAuth Success: Authorized ${user.email}`);
          const token = generateToken(user._id);

          // Redirect to frontend with Token in URL query params
          return res.redirect(`https://placement-cell-chi.vercel.app/index.html?token=${token}&success=true`);
        });
      } catch (exception) {
        console.error("❌ Google Callback Exception:", exception);
        next(exception);
      }
    })(req, res, next);
  }
);

module.exports = router;
