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
    highest_package: {
        type: Number,
        default: 0
    },
    average_package: {
        type: Number,
        default: 0
    },
    total_offers: {
        type: Number,
        default: 0
    },
    placement_rate: {
        type: Number,
        default: 0
    },
    total_companies: {
        type: Number,
        default: 0
    },
    internship_offers: {
        type: Number,
        default: 0
    },
    actively_participated: {
        type: Number,
        default: 0
    },
    companies_offered: {
        type: Number,
        default: 0
    },
    total_students: {
        type: Number,
        default: 0
    },
    branch_rates: [{
        name: String,
        rate: Number
    }],
    branch_highest: [{
        name: String,
        value: Number
    }],
    branch_average: [{
        name: String,
        value: Number
    }],
    type_distribution: [{
        name: String,
        value: Number
    }],
    is_official: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Ensure unique summary per college/batch
BatchSummarySchema.index({ college: 1, batch_year: 1 }, { unique: true });

module.exports = mongoose.model("BatchSummary", BatchSummarySchema);
