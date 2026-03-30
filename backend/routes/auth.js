const express = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * JWT Generation Strategy
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

/**
 * Verification helper for Google Tokens
 */
async function verifyGoogleToken(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  return ticket.getPayload();
}

/**
 * @desc    Google OAuth Login/Signup
 */
router.post("/google-login", async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
        return res.status(400).json({ success: false, message: "Missing Google token" });
    }

    const payload = await verifyGoogleToken(credential);
    const { email, name, picture } = payload;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        password: "google_oauth_user_" + Math.random().toString(36).slice(-8),
        role: "user",
        picture: picture || ""
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user
    });

  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Register a new user
 */
router.post("/register", async (req, res, next) => {
  const { name, email, password, role, branch, year } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ 
        success: false, 
        message: "Registration Failed", 
        error: "An account with this email already exists" 
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "user",
      branch: branch || "",
      year: year || "",
    });

    if (user) {
      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: { _id: user._id, name: user.name, email: user.email, role: user.role }
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Authenticate user & get token
 */
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        token: generateToken(user._id),
        user: { _id: user._id, name: user.name, email: user.email, role: user.role }
      });
    } else {
      res.status(401).json({ 
        success: false, 
        message: "Login Failed", 
        error: "Invalid email or password credentials" 
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Fetch current user profile
 */
router.get("/profile", protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (user) {
        res.json({
            success: true,
            user
        });
    } else {
        res.status(404).json({ 
            success: false, 
            message: "Profile Not Found", 
            error: "User record no longer exists in database" 
        });
    }
  } catch (error) {
    next(error);
  }
});

router.get("/admin", protect, admin, (req, res) => {
  res.json({ success: true, message: "Administrative verification success" });
});

module.exports = router;
