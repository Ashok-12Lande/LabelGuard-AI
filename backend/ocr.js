const { createWorker } = require("tesseract.js");
const sharp = require("sharp");


// ======================================================
// PREPARE IMAGE FOR OCR
// ======================================================

async function prepareImage(buffer, angle) {

    return await sharp(buffer)
        .rotate(angle, {
            background: {
                r: 255,
                g: 255,
                b: 255,
                alpha: 1
            }
        })

        // Make text larger for OCR
        .resize({
            width: 3000,
            withoutEnlargement: false,
            fit: "inside"
        })

        // Improve text
        .grayscale()
        .normalize()
        .sharpen({
            sigma: 1.5
        })

        .png()
        .toBuffer();
}


// ======================================================
// CLEAN OCR TEXT
// ======================================================

function cleanText(text) {

    if (!text) {
        return "";
    }

    return text
        .replace(/\r/g, "")
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join("\n")
        .trim();
}


// ======================================================
// OCR SCORE
// ======================================================

function scoreOCR(text) {

    if (!text) {
        return 0;
    }

    let score = 0;

    const upper =
        text.toUpperCase();


    // Important product-label words

    const keywords = [

        "MRP",
        "M.R.P",
        "RS",

        "SIZE",
        "CM",

        "PAGES",
        "PAGE",

        "MANUFACTURED",
        "MANUFACTURER",

        "MARKETED",
        "INDUSTRIES",

        "NOTEBOOK",
        "EXERCISE",

        "MADE IN INDIA",
        "INDIA",

        "NET",
        "QUANTITY",

        "BATCH",
        "LOT",

        "EXPIRY",
        "BEST BEFORE",

        "FSSAI"

    ];


    for (const word of keywords) {

        if (upper.includes(word)) {

            score += 20;

        }

    }


    // Numbers are useful on labels

    const numbers =
        text.match(/\d+/g) || [];

    score +=
        Math.min(
            numbers.length * 4,
            60
        );


    // Alphabetic words

    const words =
        text.match(/[A-Za-z]{3,}/g) || [];

    score +=
        Math.min(
            words.length * 2,
            80
        );


    // MRP pattern

    if (
        /M\s*\.?\s*R\s*\.?\s*P/i.test(text)
    ) {

        score += 50;

    }


    // Pages

    if (
        /PAGES?\s*[:.\-]?\s*\d+/i.test(text)
    ) {

        score += 50;

    }


    // Size

    if (
        /\d+(?:\.\d+)?\s*CM\s*[Xx×]\s*\d+(?:\.\d+)?\s*CM/i.test(text)
    ) {

        score += 70;

    }


    // Manufacturer

    if (
        /MANUFACTURED|MANUFACTURER|MARKETED|INDUSTRIES/i.test(text)
    ) {

        score += 40;

    }


    return score;
}


// ======================================================
// MAIN OCR FUNCTION
// ======================================================

async function extractText(imageBuffer) {

    console.log("");
    console.log("======================================");
    console.log("LABELGUARD AI OCR");
    console.log("======================================");


    const worker =
        await createWorker("eng");


    try {

        // ------------------------------------------------
        // TESSERACT SETTINGS
        // ------------------------------------------------

        await worker.setParameters({

            tessedit_pageseg_mode: "6",

            preserve_interword_spaces: "1"

        });


        // ------------------------------------------------
        // TRY ALL ROTATIONS
        // ------------------------------------------------

        const angles = [
            0,
            90,
            180,
            270
        ];


        let bestText = "";
        let bestScore = -1;
        let bestAngle = 0;


        for (const angle of angles) {

            console.log("");
            console.log(
                "OCR rotation:",
                angle
            );


            try {

                const processedImage =
                    await prepareImage(
                        imageBuffer,
                        angle
                    );


                const result =
                    await worker.recognize(
                        processedImage
                    );


                const text =
                    cleanText(
                        result.data.text
                    );


                const score =
                    scoreOCR(text);


                console.log(
                    "Rotation:",
                    angle
                );

                console.log(
                    "Score:",
                    score
                );

                console.log(
                    "Text length:",
                    text.length
                );


                console.log(
                    "OCR preview:"
                );

                console.log(
                    text.substring(
                        0,
                        500
                    )
                );


                if (score > bestScore) {

                    bestScore =
                        score;

                    bestText =
                        text;

                    bestAngle =
                        angle;

                }

            }

            catch (error) {

                console.error(
                    "OCR rotation failed:",
                    angle,
                    error.message
                );

            }

        }


        // ------------------------------------------------
        // FINAL RESULT
        // ------------------------------------------------

        console.log("");
        console.log(
            "======================================"
        );

        console.log(
            "BEST OCR ROTATION:",
            bestAngle
        );

        console.log(
            "BEST OCR SCORE:",
            bestScore
        );

        console.log(
            "======================================"
        );

        console.log(
            bestText
        );

        console.log(
            "======================================"
        );


        return bestText;

    }

    finally {

        await worker.terminate();

    }

}


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    extractText

};