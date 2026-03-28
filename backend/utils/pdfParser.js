const pdfParse = require('pdf-parse');

console.log("TYPE OF pdfParse:", typeof pdfParse);

if (typeof pdfParse !== "function") {
  throw new Error("pdfParse import failed: Not a function");
}

const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');
const { fromPath } = require('pdf2pic');

/**
 * Robust Text Extraction with OCR Fallback
 */
async function extractRawText(buffer) {
    try {
        console.log("Buffer size:", buffer?.length);

        if (!buffer) {
            throw new Error("No PDF buffer");
        }

        // Try standard extraction first
        const data = await pdfParse(buffer);
        const extractedText = data?.text?.trim();

        if (extractedText && extractedText.length > 50) {
            console.log("[PDF-INGEST] Standard extraction successful");
            return extractedText;
        }

        throw new Error("Standard extraction too sparse - OCR Fallback triggered");

    } catch (err) {
        console.warn("[PDF-INGEST] Switching to OCR mode...");
        
        // Persistence for OCR processing (pdf2pic requires a path)
        const tmpPath = path.join(__dirname, `ocr_${Date.now()}.pdf`);
        fs.writeFileSync(tmpPath, buffer);

        try {
            const options = {
                density: 150,
                format: "png",
                savePath: __dirname,
                saveFilename: "ocr_page"
            };

            const convert = fromPath(tmpPath, options);
            const page = await convert(1);
            
            console.log("[OCR] Recognizing text from first page...");
            const result = await Tesseract.recognize(page.path, 'eng');
            
            // CLEANUP
            if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
            if (fs.existsSync(page.path)) fs.unlinkSync(page.path);

            console.log("[OCR] Successful extraction");
            return result.data.text;

        } catch (ocrErr) {
            console.error("[OCR-ERROR] Fatal:", ocrErr.message);
            if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
            throw new Error(`OCR Processing Failed: ${ocrErr.message}`);
        }
    }
}

/**
 * Extracts structured data from raw PDF text buffer
 */
async function parsePlacementPDF(buffer, college, year) {
    console.log("[PDF-PARSER] Starting process for", college, year);
    
    // Step 1: Stable Extraction
    const rawText = await extractRawText(buffer);

    // Step 2: Structured Parsing (Multi-line Grouping)
    const lines = rawText.split('\n')
        .map(l => l.trim())
        .filter(l => {
            // Filter out empty lines and headers
            const noise = ["PACKAGE", "LPA", "Job Offers", "S.No", "S. NO.", "PLACEMENT", "BATCH"];
            return l.length > 0 && !noise.some(n => l.toUpperCase().includes(n));
        });

    console.log(`[PDF-PARSER] Filtered down to ${lines.length} potential data lines.`);
    const results = [];

    // Grouping Algorithm: Look for [Name] [Package] [Offers] pattern in sliding window
    for (let i = 0; i < lines.length - 2; i++) {
        const name = lines[i];
        const pkgStr = lines[i + 1].replace(/[^\d.]/g, ''); // Extract numeric part
        const offersStr = lines[i + 2].replace(/[^\d+]/g, ''); // Extract numeric and '+' 

        const pkgVal = parseFloat(pkgStr);
        const offersVal = parseInt(offersStr.replace('+', ''));

        // Validation: Middle line MUST be a valid numeric package
        if (!isNaN(pkgVal) && pkgVal > 0) {
            results.push({
                company_name: name,
                package: pkgVal + " LPA",
                students_placed: isNaN(offersVal) ? 1 : offersVal,
                batch_year: year,
                college: college,
                role: "Software Engineering / Associate", // Default fallback
                company_type: "Technology"
            });

            i += 2; // Success: Consume this group of 3 and move forward
        }
    }

    console.log("Total extracted rows:", results.length);

    if (results.length === 0) {
        throw new Error("Could not parse placement data - unsupported vertical format or missing numeric records.");
    }

    return results;
}

module.exports = { parsePlacementPDF };
