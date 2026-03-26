const mongoose = require("mongoose");

const ApplicationSchema = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    company_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
    },
    // Legacy IDs to help with migration linkings
    legacy_student_id: Number,
    legacy_company_id: Number,
    status: {
        type: String,
        default: "applied",
    },
    applied_at: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Application", ApplicationSchema);
