const mongoose = require("mongoose");

const PlacementStatsSchema = new mongoose.Schema({
    company_name: {
        type: String,
        required: true
    },
    package_lpa: {
        type: String, // Storing as string to handle "3-5" or "5+" cases
        required: true
    },
    package_numeric: {
        type: Number, // For calculations (e.g., Average/Highest)
        default: 0
    },
    offers: {
        type: Number,
        required: true,
        default: 0
    },
    year: {
        type: Number,
        required: true
    },
    college: {
        type: String,
        required: true,
        enum: ["USAR", "USICT"]
    }
}, { timestamps: true });

module.exports = mongoose.model("PlacementStats", PlacementStatsSchema);
