const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');
const { fromPath } = require('pdf2pic');

/**
 * Robust Text Extraction with OCR Fallback
 */
async function extractRawText(buffer) {
    if (!buffer) throw new Error("No PDF buffer provided");

    try {
        // Try standard extraction first
        const data = await pdfParse(buffer);
        const extractedText = data?.text?.trim();

        if (extractedText && extractedText.length > 50) {
            return extractedText;
        }
        throw new Error("Standard extraction too sparse");

    } catch (err) {
        // Persistence for OCR processing
        const tmpPath = path.join(__dirname, `ocr_${Date.now()}.pdf`);
        fs.writeFileSync(tmpPath, buffer);

        try {
            const options = {
                density: 150,
                format: "png",
                savePath: __dirname,
                saveFilename: `ocr_temp_${Date.now()}`
            };

            const convert = fromPath(tmpPath, options);
            const page = await convert(1);
            
            const result = await Tesseract.recognize(page.path, 'eng');
            
            // CLEANUP
            if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
            if (fs.existsSync(page.path)) fs.unlinkSync(page.path);

            return result.data.text;

        } catch (ocrErr) {
            if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
            throw new Error(`OCR Processing Failed: ${ocrErr.message}`);
        }
    }
}

/**
 * Extracts structured data from raw PDF text buffer
 */
async function parsePlacementPDF(buffer, college, year) {
    // Step 1: Extract Raw Text
    const rawText = await extractRawText(buffer);
    if (!rawText) throw new Error("Could not extract any text from the PDF.");

    const cleanedLines = rawText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 3);

    // Filter Logic
    function isValidLine(line) {
        return /\d/.test(line) && /lpa/i.test(line);
    }

    const results = [];
    cleanedLines.forEach(line => {
        if (!isValidLine(line)) return;

        // Pattern: [Company] [Value] LPA [Offers?]
        const match = line.match(/([A-Za-z &.]+)\s+(\d+(\.\d+)?)\s*LPA\s*(\d+)?/i);

        if (match) {
            results.push({
                company_name: match[1].trim(),
                package: match[2] + " LPA",
                students_placed: match[4] ? parseInt(match[4]) : 1,
                batch_year: year,
                college: college,
                role: "Software Engineering / Associate",
                company_type: "Technology"
            });
        }
    });

    const blacklist = ["university", "school", "report", "analysis", "overall", "total", "summary"];
    const filteredResults = results.filter(r => {
        return !blacklist.some(word => r.company_name.toLowerCase().includes(word));
    });

    // FALLBACK FOR BAD OCR
    if (filteredResults.length < 3) {
        return cleanedLines.slice(0, 10).map(line => ({
            company_name: "RAW: " + line,
            package: "0 LPA",
            students_placed: 0,
            batch_year: year,
            college: college,
            role: "N/A",
            company_type: "N/A",
            isFallback: true
        }));
    }

    return filteredResults;
}

module.exports = { parsePlacementPDF };
