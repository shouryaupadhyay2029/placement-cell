const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema({
    // Original Python placement_record fields
    student_name: {
        type: String,
    },
    company_name: {
        type: String,
    },
    branch: {
        type: String,
    },
    year: {
        type: Number,
    },
    // Required fields from Task 1
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
    },
    skills: {
        type: [String],
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    // Optional legacy data
    package: String,
    package_str: String,
});

module.exports = mongoose.model("Student", StudentSchema);
