/**
 * Entry point for the backend server
 * Placement Dashboard Authentication System
 */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Initialize the Express app
const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Body parser for JSON

/** 
 * --- FRONTEND STATIC SERVING ---
 * Serve the UI files (HTML, JS, CSS) from the parent directory
 */
app.use("/html", express.static(path.join(__dirname, "../html")));
app.use("/js", express.static(path.join(__dirname, "../js")));
app.use("/css", express.static(path.join(__dirname, "../css")));

/** 
 * MongoDB Connection setup 
 */
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ MongoDB Atlas connected successfully");
        console.log("📦 Loaded Database models");
    })
    .catch((err) => {
        console.error("❌ MongoDB connection error:", err.message);
        process.exit(1);
    });

// Import route handlers
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/studentRoutes");
const companyRoutes = require("./routes/companyRoutes");
const placementRoutes = require("./routes/placementRoutes");
const { protect, admin } = require("./middleware/authMiddleware");
const { enforceCollege } = require("./middleware/collegeMiddleware");

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/students", enforceCollege, studentRoutes);
app.use("/api/companies", enforceCollege, companyRoutes);
app.use("/api/placements", enforceCollege, placementRoutes);

app.get("/api/profile", protect, (req, res) => {
    res.json(req.user);
});

app.get("/api/admin", protect, admin, (req, res) => {
    res.status(200).json({ message: "Admin authenticated access granted" });
});

// Root Redirect (Auto-open home page)
app.get("/", (req, res) => {
    res.redirect("/html/web.html");
});

/**
 * Handle 404 routes
 */
app.use((req, res) => {
    res.status(404).json({ message: "Requested route does not exist" });
});

// Bind server to port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`📡 Server actively listening on port ${PORT}`);
    console.log(`🔗 Local link: http://localhost:${PORT}`);
    console.log(`🏠 Home page: http://localhost:${PORT}/html/web.html`);
});