const express = require("express");
const multer = require("multer");
const cors = require("cors");

const { extractText } = require("../backend/ocr");
const { extractProductInfo } = require("../backend/extractor");
const { checkCompliance } = require("../backend/compliance");

const app = express();

app.use(cors());

const upload = multer({
    storage: multer.memoryStorage()
});

// Test route
app.get("/", (req, res) => {
    res.send("LabelGuard AI Backend is Working!");
});

// Analyze product
app.post("/", upload.single("productImage"), async (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No product image received."
        });
    }

    console.log("Product image received!");
    console.log("File name:", req.file.originalname);
    console.log("File size:", req.file.size, "bytes");

    try {

        console.log("Starting OCR...");

        const extractedText = await extractText(req.file.buffer);

        console.log("OCR completed!");

        const productInfo = extractProductInfo(extractedText);

        console.log("Product Information:");
        console.log(productInfo);

        const compliance = checkCompliance(productInfo);

        console.log("Compliance Result:");
        console.log(compliance);

        return res.json({
            success: true,
            message: "Product analyzed successfully!",
            text: extractedText,
            productInfo: productInfo,
            compliance: compliance
        });

    } catch (error) {

        console.error("Product Analysis Error:", error);

        return res.status(500).json({
            success: false,
            message: "Product analysis failed.",
            error: error.message
        });
    }
});

module.exports = app;