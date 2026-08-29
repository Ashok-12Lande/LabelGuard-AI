const { createWorker } = require("tesseract.js");
const sharp = require("sharp");


// ======================================================
// IMAGE PREPROCESSING
// ======================================================

async function prepareImage(imageBuffer, angle, mode = "normal") {

    let image = sharp(imageBuffer)
        .rotate(angle, {
            background: {
                r: 255,
                g: 255,
                b: 255,
                alpha: 1
            }
        })
        .resize({
            width: 2800,
            withoutEnlargement: false,
            fit: "inside"
        });


    // --------------------------------------------------
    // NORMAL
    // --------------------------------------------------

    if (mode === "normal") {

        return await image
            .grayscale()
            .normalize()
            .sharpen({
                sigma: 1.2
            })
            .png()
            .toBuffer();

    }


    // --------------------------------------------------
    // HIGH CONTRAST
    // --------------------------------------------------

    if (mode === "contrast") {

        return await image
            .grayscale()
            .normalize()
            .linear(1.4, -30)
            .sharpen({
                sigma: 1.5
            })
            .png()
            .toBuffer();

    }


    // --------------------------------------------------
    // THRESHOLD
    // --------------------------------------------------

    if (mode === "threshold") {

        return await image
            .grayscale()
            .normalize()
            .threshold(170)
            .png()
            .toBuffer();

    }


    // --------------------------------------------------
    // SHARP
    // --------------------------------------------------

    if (mode === "sharp") {

        return await image
            .grayscale()
            .normalize()
            .sharpen({
                sigma: 2
            })
            .linear(1.2, -15)
            .png()
            .toBuffer();

    }


    return await image
        .grayscale()
        .normalize()
        .png()
        .toBuffer();

}


// ======================================================
// CLEAN OCR TEXT
// ======================================================

function cleanOCRText(text) {

    if (!text) {
        return "";
    }

    return text
        .replace(/\n\s*\n\s*\n+/g, "\n\n")
        .split("\n")
        .map(line => line.trim())
        .join("\n")
        .replace(/[ \t]{3,}/g, "  ")
        .trim();

}


// ======================================================
// OCR SCORE
// ======================================================

function calculateOCRScore(text) {

    if (!text) {
        return 0;
    }


    const upperText =
        text.toUpperCase();


    const keywords = [

        "MRP",
        "M.R.P",
        "RS",

        "PRODUCT",
        "NOTEBOOK",
        "EXERCISE",

        "MANUFACTURED",
        "MANUFACTURER",
        "MARKETED",
        "INDUSTRIES",

        "NET",
        "QUANTITY",

        "PAGES",
        "PAGE",

        "SIZE",
        "CM",

        "FSSAI",

        "BATCH",
        "LOT",

        "EXPIRY",
        "EXPIRES",

        "BEST BEFORE",

        "INDIA",
        "MADE IN INDIA",

        "A4"

    ];


    let score = 0;


    // --------------------------------------------------
    // KEYWORDS
    // --------------------------------------------------

    for (const keyword of keywords) {

        if (upperText.includes(keyword)) {

            score += 10;

        }

    }


    // --------------------------------------------------
    // READABLE WORDS
    // --------------------------------------------------

    const words =
        text.match(/[A-Za-z]{3,}/g) || [];


    score += Math.min(
        words.length,
        50
    );


    // --------------------------------------------------
    // NUMBERS
    // --------------------------------------------------

    const numbers =
        text.match(/\d+/g) || [];


    score += Math.min(
        numbers.length * 3,
        30
    );


    // --------------------------------------------------
    // SIZE PATTERN BONUS
    // --------------------------------------------------

    if (
        /\d+(?:\.\d+)?\s*CM\s*[Xx×]\s*\d+(?:\.\d+)?\s*CM/i.test(text)
    ) {

        score += 40;

    }


    // --------------------------------------------------
    // MRP PATTERN BONUS
    // --------------------------------------------------

    if (
        /M\s*\.?\s*R\s*\.?\s*P/i.test(text)
    ) {

        score += 20;

    }


    // --------------------------------------------------
    // PAGES PATTERN BONUS
    // --------------------------------------------------

    if (
        /PAGES?\s*[:.\-]?\s*\d+/i.test(text)
    ) {

        score += 20;

    }


    // --------------------------------------------------
    // TEXT LENGTH
    // --------------------------------------------------

    if (text.length > 100) {

        score += 10;

    }


    if (text.length > 300) {

        score += 10;

    }


    return score;

}


// ======================================================
// MAIN OCR FUNCTION
// ======================================================

async function extractText(imageBuffer) {

    console.log("Preparing image...");


    const worker =
        await createWorker("eng");


    // ==================================================
    // TESSERACT SETTINGS
    // ==================================================

    await worker.setParameters({

        tessedit_pageseg_mode: "6",

        preserve_interword_spaces: "1",

        tessedit_char_whitelist:
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789₹./:-()%&,@+×x "

    });


    // ==================================================
    // OCR ANGLES
    // ==================================================

    const angles = [

        0,
        90,
        180,
        270

    ];


    // ==================================================
    // IMAGE MODES
    // ==================================================

    const modes = [

        "normal",
        "contrast",
        "threshold",
        "sharp"

    ];


    let bestText = "";

    let bestScore = -1;

    let bestAngle = 0;

    let bestMode = "normal";


    // ==================================================
    // OCR PASSES
    // ==================================================

    for (const angle of angles) {

        for (const mode of modes) {

            console.log(
                `OCR pass: ${angle}° | ${mode}`
            );


            try {

                const processedImage =
                    await prepareImage(
                        imageBuffer,
                        angle,
                        mode
                    );


                const result =
                    await worker.recognize(
                        processedImage
                    );


                let text =
                    result.data.text || "";


                text =
                    cleanOCRText(text);


                const score =
                    calculateOCRScore(text);


                console.log(
                    `Pass ${angle}° | ${mode} | score: ${score} | length: ${text.length}`
                );


                if (score > bestScore) {

                    bestScore = score;

                    bestText = text;

                    bestAngle = angle;

                    bestMode = mode;

                }


            }
            catch (error) {

                console.error(
                    `OCR pass ${angle}° | ${mode} failed:`,
                    error.message
                );

            }

        }

    }


    // ==================================================
    // TERMINATE WORKER
    // ==================================================

    await worker.terminate();


    // ==================================================
    // RESULT
    // ==================================================

    console.log(
        "================================="
    );

    console.log(
        "Best OCR angle:",
        bestAngle + "°"
    );

    console.log(
        "Best OCR mode:",
        bestMode
    );

    console.log(
        "Best OCR score:",
        bestScore
    );

    console.log(
        "OCR processing completed!"
    );

    console.log(
        "================================="
    );


    return bestText;

}


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    extractText

};