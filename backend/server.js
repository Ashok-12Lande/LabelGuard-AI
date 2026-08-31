const express = require("express");
const multer = require("multer");
const cors = require("cors");

const { extractText } = require("./ocr");
const { extractProductInfo } = require("./extractor");
const { checkCompliance } = require("./compliance");

const app = express();

const PORT = 3000;


// ======================================================
// CORS
// ======================================================

app.use(cors());


// ======================================================
// MULTER
// ======================================================

const upload = multer({
    storage: multer.memoryStorage(),

    limits: {
        fileSize: 10 * 1024 * 1024
    }
});


// ======================================================
// HOME TEST
// ======================================================

app.get("/", (req, res) => {

    res.status(200).json({

        success: true,

        message:
            "LabelGuard AI backend is running!",

        api:
            "POST /api/analyze"

    });

});


// ======================================================
// API TEST
// ======================================================

app.get("/api/analyze", (req, res) => {

    res.status(200).json({

        success: true,

        message:
            "LabelGuard AI Analyze API is working!",

        method:
            "GET"

    });

});


// ======================================================
// ANALYZE PRODUCT
// ======================================================

app.post(
    "/api/analyze",

    upload.single("productImage"),

    async (req, res) => {

        console.log("");
        console.log("================================");
        console.log("LABELGUARD AI ANALYSIS REQUEST");
        console.log("================================");


        // --------------------------------------------------
        // CHECK IMAGE
        // --------------------------------------------------

        if (!req.file) {

            console.log(
                "❌ No image received."
            );

            return res.status(400).json({

                success: false,

                message:
                    "No product image received."

            });

        }


        console.log(
            "✅ Image received!"
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

            // ==============================================
            // STEP 1 - OCR
            // ==============================================

            console.log("");
            console.log(
                "STEP 1: Starting OCR..."
            );


            const extractedText =
                await extractText(
                    req.file.buffer
                );


            console.log(
                "✅ OCR completed."
            );


            console.log("");
            console.log(
                "========== OCR TEXT =========="
            );

            console.log(
                extractedText
            );

            console.log(
                "=============================="
            );


            // ==============================================
            // STEP 2 - EXTRACT PRODUCT INFORMATION
            // ==============================================

            console.log("");
            console.log(
                "STEP 2: Extracting product information..."
            );


            const productInfo =
                extractProductInfo(
                    extractedText
                );


            console.log(
                "✅ Product information extracted."
            );


            console.log(
                productInfo
            );


            // ==============================================
            // STEP 3 - COMPLIANCE
            // ==============================================

            console.log("");
            console.log(
                "STEP 3: Checking compliance..."
            );


            const compliance =
                checkCompliance(
                    productInfo
                );


            console.log(
                "✅ Compliance check completed."
            );


            console.log(
                compliance
            );


            // ==============================================
            // SEND RESULT
            // ==============================================

            console.log("");
            console.log(
                "✅ ANALYSIS COMPLETE"
            );

            console.log(
                "================================"
            );


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

            console.error("");
            console.error(
                "❌ ANALYSIS ERROR"
            );

            console.error(
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
// 404 HANDLER
// ======================================================

app.use((req, res) => {

    res.status(404).json({

        success: false,

        message:
            "Route not found.",

        path:
            req.path,

        method:
            req.method

    });

});


// ======================================================
// ERROR HANDLER
// ======================================================

app.use((error, req, res, next) => {

    console.error(
        "Server error:",
        error
    );


    res.status(500).json({

        success: false,

        message:
            "Server error.",

        error:
            error.message

    });

});


// ======================================================
// START SERVER
// ======================================================

app.listen(
    PORT,
    () => {

        console.log("");
        console.log(
            "======================================"
        );

        console.log(
            "LabelGuard AI server running at:"
        );

        console.log(
            `http://localhost:${PORT}`
        );

        console.log(
            "API endpoint:"
        );

        console.log(
            `http://localhost:${PORT}/api/analyze`
        );

        console.log(
            "======================================"
        );

    }
);