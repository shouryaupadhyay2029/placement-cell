const express = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Debug Log for Server Initialization
console.log("GOOGLE_CLIENT_ID configured:", process.env.GOOGLE_CLIENT_ID);

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

router.post("/google-login", async (req, res) => {
  try {
    const { credential } = req.body;
    console.log("--- GOOGLE LOGIN REQUEST ---");
    console.log("Credential exists:", !!credential);
    if (credential) {
      console.log("Token Length:", credential.length);
    }
    console.log("Audience for Verify (Client ID):", process.env.GOOGLE_CLIENT_ID);

    if (!credential) {
        console.error("GOOGLE LOGIN ERROR: Missing token in request body");
        return res.status(400).json({ success: false, message: "Missing Google token" });
    }

    console.log("Verifying token with Google library...");
    const payload = await verifyGoogleToken(credential);
    
    // Log decoded user on success
    console.log("✅ GOOGLE VERIFICATION SUCCESS");
    console.log("Decoded User Email:", payload.email);
    console.log("Decoded User Name:", payload.name);

    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    // Check if user exists
    let user = await User.findOne({ email });

    if (!user) {
      console.log("Creating new database record for:", email);
      user = await User.create({
        name,
        email,
        password: "google_oauth_user_" + Math.random().toString(36).slice(-8), // More secure placeholder
        role: "user",
        picture: picture || ""
      });
    } else {
      console.log("Existing user found in database:", user.email);
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user
    });

  } catch (error) {
    console.error("❌ GOOGLE VERIFICATION FAILED");
    console.error("Error Message:", error.message);
    // Log full error stack for debugging
    console.error("Full Error Stack:", error);
    
    res.status(400).json({
      success: false,
      message: "Invalid Google token: " + error.message
    });
  }
});

// @desc    Register a new user
router.post("/register", async (req, res) => {
  const { name, email, password, role, branch, year } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

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
        token: generateToken(user._id),
        user: { _id: user._id, name: user.name, email: user.email, role: user.role }
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// @desc    Authenticate user & get token
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      res.json({
        token: generateToken(user._id),
        user: { _id: user._id, name: user.name, email: user.email, role: user.role }
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (user) res.json(user);
    else res.status(404).json({ message: "User not found" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/admin", protect, admin, (req, res) => {
  res.json({ message: "Admin dashboard access granted!" });
});

module.exports = router;
