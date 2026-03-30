const mongoose = require("mongoose");

const BatchSummarySchema = new mongoose.Schema({
    college: {
        type: String,
        required: true,
        enum: ["USAR", "USICT"]
    },
    batch_year: {
        type: String,
        required: true
    },
    highest_package: { type: Number, default: 0 },
    average_package: { type: Number, default: 0 },
    median_package:  { type: Number, default: 0 },
    total_offers:    { type: Number, default: 0 },
    ppo_offers:      { type: Number, default: 0 },
    placement_rate:  { type: Number, default: 0 },
    total_companies: { type: Number, default: 0 },
    internship_offers:      { type: Number, default: 0 },
    actively_participated:  { type: Number, default: 0 },
    companies_offered:      { type: Number, default: 0 },
    total_students:         { type: Number, default: 0 },

    branch_rates:   [{ name: String, rate: Number }],
    branch_highest: [{ name: String, value: Number }],
    branch_average: [{ name: String, value: Number }],
    branch_median:  [{ name: String, value: Number }],

    // Rich per-branch breakdown for popup cards
    branch_full: [{
        name:        String,
        total:       Number,
        participated: Number,
        placed:      Number,
        rate:        Number,
        avg_package: Number,
        median_package: Number,
        highest_package: Number
    }],

    type_distribution: [{ name: String, value: Number }],
    is_official: { type: Boolean, default: true }
}, { timestamps: true });

BatchSummarySchema.index({ college: 1, batch_year: 1 }, { unique: true });

module.exports = mongoose.model("BatchSummary", BatchSummarySchema);
