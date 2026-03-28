const express = require('express');
const router = express.Router();
const multer = require('multer');
const { parsePlacementPDF } = require('../utils/pdfParser');
const Company = require('../models/Company');
const { protect } = require('../middleware/authMiddleware');

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
router.post('/upload', upload.single('pdf'), async (req, res) => {
    console.log("[PDF-INGEST] Extraction request received.");
    
    try {
        const { batch_year } = req.body;
        const college = req.college; // From enforceCollege middleware

        if (!req.file) {
            return res.status(400).json({ success: false, error: "No PDF file provided." });
        }

        if (!batch_year) {
            return res.status(400).json({ success: false, error: "Batch year is required." });
        }

        console.log(`[PDF-INGEST] Parsing for ${college} | Batch ${batch_year}`);

        // Parsing using the refactored buffer-based utility
        const results = await parsePlacementPDF(req.file.buffer, college, batch_year);

        if (results.length === 0) {
            return res.status(422).json({
                success: false,
                error: "Could not parse placement data. Please ensure the PDF is text-based and follows the expected layout."
            });
        }

        res.json({ 
            success: true, 
            message: `Extracted ${results.length} companies successfully.`,
            data: results 
        });

    } catch (err) {
        console.error("[PDF-INGEST] Critical Parsing Failure:", err);
        res.status(500).json({ success: false, error: "Parsing failed: " + err.message });
    }
});

/**
 * @route POST /api/ingest/save
 * @desc Finalizes ingestion by saving confirmed data to database
 */
router.post('/save', protect, async (req, res) => {
    const { data } = req.body;
    const college = req.college;

    if (!data || !Array.isArray(data)) {
        return res.status(400).json({ success: false, error: "Invalid data format received." });
    }

    try {
        // Enforce STRICT ISOLATION by re-injecting current college context
        const finalizedRecords = data.map(record => ({
            ...record,
            college: college // Override any accidental variations
        }));

        const result = await Company.insertMany(finalizedRecords);
        console.log(`[INGEST-DB] Saved ${result.length} records for ${college}`);
        
        res.json({ 
            success: true, 
            message: `Data synchronized successfully. ${result.length} institutional records added.` 
        });

    } catch (err) {
        console.error("[INGEST-DB] Critical Write Error:", err);
        res.status(500).json({ success: false, error: "Database storage failed: " + err.message });
    }
});

module.exports = router;
