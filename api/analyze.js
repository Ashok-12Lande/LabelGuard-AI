const multer = require("multer");
const cors = require("cors");

const { extractText } = require("../backend/ocr");
const { extractProductInfo } = require("../backend/extractor");
const { checkCompliance } = require("../backend/compliance");


// ======================================================
// CORS
// ======================================================

const corsMiddleware = cors();


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
// RUN MIDDLEWARE
// ======================================================

function runMiddleware(req, res, fn) {

    return new Promise((resolve, reject) => {

        fn(req, res, (result) => {

            if (result instanceof Error) {
                return reject(result);
            }

            return resolve(result);

        });

    });

}


// ======================================================
// VERCEL SERVERLESS FUNCTION
// ======================================================

module.exports = async (req, res) => {

    console.log("================================");
    console.log("LABELGUARD AI API");
    console.log("METHOD:", req.method);
    console.log("URL:", req.url);
    console.log("================================");


    // ==================================================
    // CORS
    // ==================================================

    await runMiddleware(
        req,
        res,
        corsMiddleware
    );


    // ==================================================
    // GET TEST
    // ==================================================

    if (req.method === "GET") {

        return res.status(200).json({

            success: true,

            message:
                "LabelGuard AI API is working!",

            method:
                "GET"

        });

    }


    // ==================================================
    // ONLY POST ALLOWED FOR ANALYSIS
    // ==================================================

    if (req.method !== "POST") {

        return res.status(405).json({

            success: false,

            message:
                "Only POST method is allowed."

        });

    }


    // ==================================================
    // RECEIVE IMAGE
    // ==================================================

    try {

        await runMiddleware(
            req,
            res,
            upload.single("productImage")
        );

    }

    catch (error) {

        console.error(
            "Upload Error:",
            error
        );

        return res.status(400).json({

            success: false,

            message:
                "Image upload failed.",

            error:
                error.message

        });

    }


    // ==================================================
    // CHECK IMAGE
    // ==================================================

    if (!req.file) {

        return res.status(400).json({

            success: false,

            message:
                "No product image received."

        });

    }


    console.log("================================");
    console.log("IMAGE RECEIVED");
    console.log("File:",
        req.file.originalname
    );
    console.log("Size:",
        req.file.size,
        "bytes"
    );
    console.log("================================");


    try {

        // ==================================================
        // STEP 1 — OCR
        // ==================================================

        console.log(
            "Starting OCR..."
        );


        const extractedText =
            await extractText(
                req.file.buffer
            );


        console.log(
            "OCR completed."
        );


        console.log(
            "OCR TEXT:"
        );

        console.log(
            extractedText
        );


        // ==================================================
        // STEP 2 — EXTRACT PRODUCT INFORMATION
        // ==================================================

        console.log(
            "Extracting product information..."
        );


        const productInfo =
            extractProductInfo(
                extractedText
            );


        console.log(
            "Product information extracted."
        );


        console.log(
            productInfo
        );


        // ==================================================
        // STEP 3 — COMPLIANCE
        // ==================================================

        console.log(
            "Checking compliance..."
        );


        const compliance =
            checkCompliance(
                productInfo
            );


        console.log(
            "Compliance check completed."
        );


        console.log(
            compliance
        );


        // ==================================================
        // STEP 4 — SEND COMPLETE RESULT
        // ==================================================

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
            "================================"
        );

        console.error(
            "PRODUCT ANALYSIS ERROR"
        );

        console.error(
            error
        );

        console.error(
            "================================"
        );


        return res.status(500).json({

            success: false,

            message:
                "Product analysis failed.",

            error:
                error.message

        });

    }

};