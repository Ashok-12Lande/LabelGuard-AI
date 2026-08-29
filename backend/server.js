const express = require("express");
const multer = require("multer");
const cors = require("cors");

const { extractText } = require("./ocr");
const { extractProductInfo } = require("./extractor");
const { checkCompliance } = require("./compliance");

const app = express();

const PORT = 3000;


// ================= CORS =================

app.use(cors());


// ================= FILE UPLOAD =================

const upload = multer({
    storage: multer.memoryStorage()
});


// ================= TEST ROUTE =================

app.get("/", (req, res) => {

    res.send(
        "LabelGuard AI Backend is Working! 🚀"
    );

});


// ================= ANALYZE PRODUCT =================

app.post(
    "/analyze",
    upload.single("productImage"),
    async (req, res) => {

        // Check image

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

            // ================= STEP 1: OCR =================

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


            // ================= STEP 2: PRODUCT INFO =================

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


            // ================= STEP 3: COMPLIANCE =================

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


            // ================= SEND RESPONSE =================

            res.json({

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


        } catch (error) {

            console.error(
                "Product Analysis Error:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    "Product analysis failed.",

                error:
                    error.message

            });

        }

    }
);


// ================= START SERVER =================

app.listen(
    PORT,
    () => {

        console.log(
            `LabelGuard AI server running at http://localhost:${PORT}`
        );

    }
);