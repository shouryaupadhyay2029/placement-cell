const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
require("dotenv").config();

// Initialize the Express app
const app = express();

// Middlewares
app.use(helmet({
    contentSecurityPolicy: false, // Allow external assets if needed
}));
app.use(cors({
    origin: (origin, callback) => callback(null, true), 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json()); // Body parser for JSON

/** 
 * --- FRONTEND STATIC SERVING ---
 * Serve the UI files (HTML, JS, CSS) from the 'frontend' directory
 */
app.use("/html", express.static(path.join(__dirname, "../frontend/html")));
app.use("/js", express.static(path.join(__dirname, "../frontend/js")));
app.use("/css", express.static(path.join(__dirname, "../frontend/css")));
app.use("/assets", express.static(path.join(__dirname, "../frontend/assets")));

/** 
 * MongoDB Connection setup 
 */
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("✅ Database connectivity established");
    })
    .catch((err) => {
        console.error("❌ Fatal: Database connection failure:", err.message);
        process.exit(1);
    });

// Import route handlers
const authRoutes = require("./routes/auth");
const studentRoutes = require("./routes/studentRoutes");
const companyRoutes = require("./routes/companyRoutes");
const placementRoutes = require("./routes/placementRoutes");
const pdfRoutes = require("./routes/pdfRoutes");
const { protect, admin } = require("./middleware/authMiddleware");
const { enforceCollege } = require("./middleware/collegeMiddleware");
const { lockPlacementData } = require("./middleware/dataGuardMiddleware");

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/students", enforceCollege, lockPlacementData, studentRoutes);
app.use("/api/companies", enforceCollege, lockPlacementData, companyRoutes);
app.use("/api/placements", enforceCollege, lockPlacementData, placementRoutes);
app.use("/api/ingest", enforceCollege, lockPlacementData, pdfRoutes);

app.get("/api/profile", protect, (req, res) => {
    res.json({ success: true, user: req.user });
});

app.get("/api/admin", protect, admin, (req, res) => {
    res.status(200).json({ success: true, message: "Administrative access verified" });
});

// Root Redirect (Auto-open home page)
app.get("/", (req, res) => {
    res.redirect("/html/web.html");
});

/**
 * Handle 404 routes
 */
app.use((req, res) => {
    res.status(404).json({ success: false, message: "Requested operational endpoint does not exist" });
});

/**
 * Global Error Handling Middleware
 */
app.use((err, req, res, next) => {
    console.error(`[ERROR] ${new Date().toISOString()} | ${req.method} ${req.url} | ${err.message}`);
    res.status(err.status || 500).json({
        success: false,
        message: "Internal operational failure",
        error: process.env.NODE_ENV === "production" ? "An unexpected error occurred" : err.message
    });
});

// Bind server to port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`📡 PlacePro Backend operational on port ${PORT}`);
    console.log(`🏠 Application Home: http://localhost:${PORT}/html/web.html`);
});