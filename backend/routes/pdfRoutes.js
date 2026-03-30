const express = require('express');
const router = express.Router();
const multer = require('multer');
const { parsePlacementPDF } = require('../utils/pdfParser');
const Company = require('../models/Company');
const { protect, admin } = require('../middleware/authMiddleware');

// Use Memory Storage for faster, disk-less processing
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * @route POST /api/ingest/upload
 * @desc Extracts information from PDF and returns preview JSON
 */
router.post('/upload', protect, admin, upload.single('pdf'), async (req, res, next) => {
    try {
        const { batch_year } = req.body;
        const college = req.college;

        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: "Validation Error",
                error: "No PDF file provided." 
            });
        }

        if (!batch_year) {
            return res.status(400).json({ 
                success: false, 
                message: "Validation Error",
                error: "Batch year is required." 
            });
        }

        // Parsing using the buffer-based utility
        const results = await parsePlacementPDF(req.file.buffer, college, batch_year);

        if (results.length === 0) {
            return res.status(422).json({
                success: false,
                message: "Parsing Incomplete",
                error: "Could not parse placement data. Please ensure the PDF is text-based."
            });
        }

        res.json({ 
            success: true, 
            message: `Extracted ${results.length} companies successfully.`,
            data: results 
        });

    } catch (err) {
        next(err); // Pass to global error handler
    }
});

/**
 * @route POST /api/ingest/save
 * @desc Finalizes ingestion by saving confirmed data to database
 */
router.post('/save', protect, admin, async (req, res, next) => {
    const { data } = req.body;
    const college = req.college;

    if (!data || !Array.isArray(data)) {
        return res.status(400).json({ 
            success: false, 
            message: "Validation Error",
            error: "Invalid data format received." 
        });
    }

    try {
        // Enforce STRICT ISOLATION
        const finalizedRecords = data.map(record => ({
            ...record,
            college: college 
        }));

        const result = await Company.insertMany(finalizedRecords);
        
        res.json({ 
            success: true, 
            message: `Synchronization successful. ${result.length} records added for ${college}.` 
        });

    } catch (err) {
        next(err);
    }
});

module.exports = router;
