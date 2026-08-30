const express = require("express");
const multer = require("multer");
const cors = require("cors");

const { extractText } = require("../backend/ocr");
const { extractProductInfo } = require("../backend/extractor");
const { checkCompliance } = require("../backend/compliance");

const app = express();


// ======================================================
// CORS
// ======================================================

app.use(cors());


// ======================================================
// IMAGE UPLOAD
// ======================================================

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});


// ======================================================
// TEST
// ======================================================

app.get("/", (req, res) => {

    res.status(200).json({
        success: true,
        message: "LabelGuard AI OCR API is working on Vercel!"
    });

});


// ======================================================
// ANALYZE PRODUCT
// ======================================================

app.post(
    "/",
    upload.single("productImage"),
    async (req, res) => {

        // ------------------------------------------------
        // CHECK IMAGE
        // ------------------------------------------------

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message:
                    "No product image received."

            });

        }


        console.log(
            "Product image received!"
        );

        console.log(
            "File name:",
            req.file.originalname
        );

        console.log(
            "File size:",
            req.file.size,
            "bytes"
        );


        try {

            // ============================================
            // STEP 1 — OCR
            // ============================================

            console.log(
                "Starting OCR..."
            );


            const extractedText =
                await extractText(
                    req.file.buffer
                );


            console.log(
                "OCR completed!"
            );


            // ============================================
            // STEP 2 — PRODUCT INFORMATION
            // ============================================

            const productInfo =
                extractProductInfo(
                    extractedText
                );


            console.log(
                "Product Information:"
            );

            console.log(
                productInfo
            );


            // ============================================
            // STEP 3 — COMPLIANCE
            // ============================================

            const compliance =
                checkCompliance(
                    productInfo
                );


            console.log(
                "Compliance Result:"
            );

            console.log(
                compliance
            );


            // ============================================
            // SEND RESULT
            // ============================================

            return res.status(200).json({

                success: true,

                message:
                    "Product analyzed successfully!",

                text:
                    extractedText,

                productInfo:
                    productInfo,

                compliance:
                    compliance

            });


        }
        catch (error) {

            console.error(
                "Product Analysis Error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Product analysis failed.",

                error:
                    error.message

            });

        }

    }
);


// ======================================================
// EXPORT VERCEL SERVERLESS FUNCTION
// ======================================================

module.exports = app;