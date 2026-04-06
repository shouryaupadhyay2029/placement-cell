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
router.get("/", passport.authenticate("google", { scope: ["profile", "email"] }));

/**
 * @desc    Google auth callback
 * @route   GET /auth/google/callback
 */
router.get(
  "/callback",
  passport.authenticate("google", { failureRedirect: "https://placement-cell-chi.vercel.app/index.html?error=google_login_failed" }),
  (req, res) => {
    // Successful authentication
    const token = generateToken(req.user._id);

    // Redirect to frontend with Token in URL query params
    res.redirect(`https://placement-cell-chi.vercel.app/index.html?token=${token}&success=true`);
  }
);

module.exports = router;
