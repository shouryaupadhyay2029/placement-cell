const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");

const router = express.Router();

const FRONTEND_URL = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? 'https://placement-cell-chi.vercel.app' : 'http://127.0.0.1:5500');

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
 * @route   GET /api/auth/google
 */
router.get("/", passport.authenticate("google", { scope: ["profile", "email"], session: false }));

/**
 * @desc    Google auth callback
 * @route   GET /api/auth/google/callback
 */
router.get(
  "/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false, failureRedirect: `${FRONTEND_URL}/index.html?error=google_login_failed` }, (err, user, info) => {
      try {
        if (err) {
          console.error("❌ Passport Auth Error:", err);
          return res.redirect(`${FRONTEND_URL}/index.html?error=google_login_failed`);
        }
        
        if (!user) {
          console.error("❌ Passport Callback: No user object returned by strategy.");
          return res.redirect(`${FRONTEND_URL}/index.html?error=google_user_missing`);
        }

        // Since we injected session: false, we skip req.logIn and immediately generate JWT
        if (!process.env.JWT_SECRET) {
          console.error("❌ CRITICAL: JWT_SECRET environment variable is missing.");
          return res.redirect(`${FRONTEND_URL}/index.html?error=server_config_error`);
        }

        // Successful authentication
        console.log(`✅ Google OAuth Success: Authorized ${user.email}`);
        const token = generateToken(user._id);

        // Redirect to frontend with Token in URL query params
        return res.redirect(`${FRONTEND_URL}/index.html?token=${token}&success=true`);
      } catch (exception) {
        console.error("❌ Google Callback Exception:", exception);
        next(exception);
      }
    })(req, res, next);
  }
);

module.exports = router;
