const multer = require("multer");
const cors = require("cors");

const { extractText } = require("../backend/ocr");
const { extractProductInfo } = require("../backend/extractor");
const { checkCompliance } = require("../backend/compliance");

const upload = multer({
    storage: multer.memoryStorage()
});

const corsMiddleware = cors();

function runMiddleware(req, res, middleware) {
    return new Promise((resolve, reject) => {
        middleware(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}

module.exports = async (req, res) => {

    // CORS
    await runMiddleware(req, res, corsMiddleware);

    // GET test
    if (req.method === "GET") {
        return res.status(200).send(
            "LabelGuard AI Backend is Working!"
        );
    }

    // Only POST is allowed for analysis
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method not allowed."
        });
    }

    try {

        // Read uploaded image
        await runMiddleware(
            req,
            res,
            upload.single("productImage")
        );

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No product image received."
            });
        }

        console.log("Product image received!");
        console.log("File name:", req.file.originalname);
        console.log("File size:", req.file.size);

        // OCR
        console.log("Starting OCR...");

        const extractedText =
            await extractText(req.file.buffer);

        console.log("OCR completed!");

        // Product information
        const productInfo =
            extractProductInfo(extractedText);

        // Compliance
        const compliance =
            checkCompliance(productInfo);

        // Response
        return res.status(200).json({
            success: true,
            message: "Product analyzed successfully!",
            text: extractedText,
            productInfo: productInfo,
            compliance: compliance
        });

    } catch (error) {

        console.error(
            "Product Analysis Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Product analysis failed.",
            error: error.message
        });
    }
};