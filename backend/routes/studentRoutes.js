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
        const students = await Student.find({}).sort({ createdAt: -1 });
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
        const studentExists = await Student.findOne({ email });
        if (studentExists) {
            return res.status(400).json({ message: "Student already exists with this email" });
        }

        const newStudent = await Student.create({
            name,
            email,
            branch,
            year,
            skills
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
        const student = await Student.findById(req.params.id);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        await student.remove();
        res.json({ message: "Student removed successfully" });
    } catch (error) {
        console.error("Delete Student Error:", error.message);
        res.status(500).json({ message: "Server error while deleting student profile" });
    }
});

module.exports = router;
