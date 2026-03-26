const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema({
    batch_year: {
        type: String,
        required: true,
    },
    company_name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    package: {
        type: String,
        required: true,
    },
    location: {
        type: String,
    },
    eligibility: {
        type: String,
    },
    deadline: {
        type: String,
    },
    description: {
        type: String,
    },
    company_type: {
        type: String,
    },
    min_cgpa: {
        type: Number,
    },
    allowed_branches: {
        type: String,
    },
    backlog_criteria: {
        type: String,
    },
    selection_process: {
        type: String,
    },
    application_link: {
        type: String,
    },
    status: {
        type: String,
        default: "Active",
    },
    students_placed: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model("Company", CompanySchema);
