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

// GET test
app.get("/", (req, res) => {
    res.status(200).send("LabelGuard AI Backend is Working!");
});

// POST analyze
app.post("/", upload.single("productImage"), async (req, res) => {

    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No product image received."
        });
    }

    try {
        console.log("Product image received!");

        const extractedText = await extractText(req.file.buffer);

        const productInfo = extractProductInfo(extractedText);

        const compliance = checkCompliance(productInfo);

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