const express = require("express");
const Student = require("../models/Student");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @desc    Fetch all students (Placement Data)
 * @route   GET /students
 * @access  Public
 */
router.get("/", async (req, res) => {
    try {
        const college = req.college;
        const { batch_year } = req.query;
        const query = { college };
        if (batch_year) query.year = batch_year; // Use query.year as that's the field in Student model

        const students = await Student.find(query).sort({ createdAt: -1 });
        res.json(students);
    } catch (error) {
        console.error("Fetch Students Error:", error.message);
        res.status(500).json({ message: "Server error while fetching students" });
    }
});

/**
 * @desc    Add a new student profile
 * @route   POST /students
 * @access  Private (Admin Only)
 */
router.post("/", protect, admin, async (req, res) => {
    const { name, email, branch, year, skills } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: "Name and Email are required" });
    }

    try {
        const college = req.college;
        // Search by email within the SAME college (Isolation rule)
        const studentExists = await Student.findOne({ email, college });
        if (studentExists) {
            return res.status(400).json({ message: "Student already exists in this college with this email" });
        }

        const newStudent = await Student.create({
            name,
            email,
            branch,
            year,
            skills,
            college
        });

        res.status(201).json(newStudent);
    } catch (error) {
        console.error("Add Student Error:", error.message);
        res.status(500).json({ message: "Server error while adding student profile" });
    }
});

/**
 * @desc    Delete a student profile by ID
 * @route   DELETE /students/:id
 * @access  Private (Admin Only)
 */
router.delete("/:id", protect, admin, async (req, res) => {
    try {
        const college = req.college;
        const student = await Student.findOneAndDelete({ _id: req.params.id, college });

        if (!student) {
            return res.status(404).json({ message: "Student not found in this college context" });
        }

        res.json({ message: "Student removed successfully" });
    } catch (error) {
        console.error("Delete Student Error:", error.message);
        res.status(500).json({ message: "Server error while deleting student profile" });
    }
});

module.exports = router;
