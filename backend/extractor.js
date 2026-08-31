// ======================================================
// LABELGUARD AI - PRODUCT INFORMATION EXTRACTOR
// ======================================================


// ======================================================
// NORMALIZE TEXT
// ======================================================

function normalizeText(text) {

    if (!text) {
        return "";
    }

    return text
        .replace(/\r/g, "")
        .replace(/[ \t]+/g, " ")
        .trim();

}


// ======================================================
// PRODUCT INFORMATION EXTRACTION
// ======================================================

function extractProductInfo(rawText) {

    rawText = rawText || "";

    const text =
        normalizeText(rawText);


    const upperText =
        text.toUpperCase();


    // ==================================================
    // PRODUCT CATEGORY
    // ==================================================

    let category = "Unknown";


    // Stationery

    if (
        /NOTEBOOK/i.test(text) ||
        /EXERCISE/i.test(text) ||
        /PAGES?\s*[:.]?\s*\d+/i.test(text) ||
        /SIZE\s*[:.]?\s*\d+.*CM/i.test(text)
    ) {

        category = "Stationery";

    }


    // Food

    else if (
        /FSSAI/i.test(text) ||
        /INGREDIENTS/i.test(text) ||
        /NUTRITION/i.test(text) ||
        /NET\s*(WEIGHT|QUANTITY)/i.test(text) ||
        /BEST\s*BEFORE/i.test(text)
    ) {

        category = "Food";

    }


    // Cosmetics

    else if (
        /COSMETIC/i.test(text) ||
        /BATCH\s*NO/i.test(text) ||
        /MANUFACTURED\s*BY/i.test(text)
    ) {

        category = "Cosmetics";

    }


    // ==================================================
    // PRODUCT NAME
    // ==================================================

    let productName = "Not detected";


    // Exact known product

    if (/PARLE[\s-]*G/i.test(text)) {

        productName = "Parle-G Biscuits";

    }


    // Exercise Notebook
    // Handles OCR spaces/newlines between words

    else if (
        /EXERCISE[\s\S]{0,40}NOTE[\s\S]{0,40}BOOK/i.test(rawText) ||
        /EXERCISE[\s\S]{0,40}NOTEBOOK/i.test(rawText)
    ) {

        productName = "Exercise Notebook";

    }


    // If OCR separates NOTE and BOOK

    else if (
        /EXERCISE/i.test(text) &&
        /NOTE/i.test(text) &&
        /BOOK/i.test(text)
    ) {

        productName = "Exercise Notebook";

    }


    // Normal notebook

    else if (/NOTEBOOK/i.test(text)) {

        productName = "Notebook";

    }


    // ==================================================
    // MRP
    // ==================================================

    let mrp = "Not detected";


    /*
        IMPORTANT:

        OCR may read:

        M.R.P. ₹ 85/-

        as:

        M.R.P.3 : 85/-

        Therefore we should NOT simply take the
        first number after MRP.

        We first look for the number after ':'.
    */


    let mrpMatch =
        rawText.match(
            /M\s*\.?\s*R\s*\.?\s*P\s*\.?\s*[^\d\n]{0,15}[:]\s*(\d+(?:\.\d+)?)\s*(?:\/\s*-)?/i
        );


    if (mrpMatch) {

        mrp =
            `₹ ${mrpMatch[1]}`;

    }


    // ----------------------------------------------
    // MRP with ₹ / Rs / INR
    // ----------------------------------------------

    if (mrp === "Not detected") {

        mrpMatch =
            rawText.match(
                /M\s*\.?\s*R\s*\.?\s*P\s*\.?\s*(?:₹|RS|INR)?\s*(\d+(?:\.\d+)?)\s*(?:\/\s*-)/i
            );


        if (mrpMatch) {

            mrp =
                `₹ ${mrpMatch[1]}`;

        }

    }


    // ----------------------------------------------
    // MRP followed by colon somewhere
    // ----------------------------------------------

    if (mrp === "Not detected") {

        mrpMatch =
            rawText.match(
                /M\s*\.?\s*R\s*\.?\s*P[\s\S]{0,30}?:\s*(\d+(?:\.\d+)?)/i
            );


        if (mrpMatch) {

            mrp =
                `₹ ${mrpMatch[1]}`;

        }

    }


    // ----------------------------------------------
    // Final MRP backup
    // ----------------------------------------------

    if (mrp === "Not detected") {

        mrpMatch =
            rawText.match(
                /(?:MRP|M\.R\.P\.?)[^\d]{0,20}(\d+(?:\.\d+)?)\s*\/\s*-/i
            );


        if (mrpMatch) {

            mrp =
                `₹ ${mrpMatch[1]}`;

        }

    }


    // ==================================================
    // PAGES
    // ==================================================

    let pages = "Not detected";


    const pagesMatch =
        rawText.match(
            /PAGES?\s*[:.\-]?\s*(\d+)/i
        );


    if (pagesMatch) {

        pages =
            pagesMatch[1];

    }


    // ==================================================
    // SIZE
    // ==================================================

    let size = "Not detected";


    const sizePatterns = [

        // SIZE : 21 CM X 29.7 CM

        /SIZE\s*[:.\-]?\s*(\d+(?:\.\d+)?)\s*CM\s*[Xx×]\s*(\d+(?:\.\d+)?)\s*CM/i,


        // SIZE : 21 X 29.7 CM

        /SIZE\s*[:.\-]?\s*(\d+(?:\.\d+)?)\s*[Xx×]\s*(\d+(?:\.\d+)?)\s*CM/i,


        // 21 CM X 29.7 CM

        /(\d+(?:\.\d+)?)\s*CM\s*[Xx×]\s*(\d+(?:\.\d+)?)\s*CM/i,


        // SIZE : 21 X 29.7

        /SIZE\s*[:.\-]?\s*(\d+(?:\.\d+)?)\s*[Xx×]\s*(\d+(?:\.\d+)?)/i

    ];


    for (const pattern of sizePatterns) {

        const match =
            rawText.match(pattern);


        if (match) {

            size =
                `${match[1]} CM X ${match[2]} CM`;

            break;

        }

    }


    // ==================================================
    // NET QUANTITY
    // ==================================================

    let netQuantity = "Not detected";


    const isNotebook =
        /NOTEBOOK|EXERCISE/i.test(text);


    // Not normally required for notebook

    if (!isNotebook) {

        const quantityMatch =
            rawText.match(
                /(?:NET\s*(?:WEIGHT|WT|QTY|QUANTITY))\s*[:.]?\s*(\d+(?:\.\d+)?)\s*(KG|G|GM|ML|L|PCS|PIECES|PACK)/i
            );


        if (quantityMatch) {

            netQuantity =
                `${quantityMatch[1]} ${quantityMatch[2].toUpperCase()}`;

        }

    }


    // ==================================================
    // BEST BEFORE / EXPIRY
    // ==================================================

    let bestBefore = "Not detected";


    const expiryMatch =
        rawText.match(
            /(?:BEST\s*BEFORE|USE\s*BY|EXPIRY|EXP\.?\s*DATE)\s*[:.]?\s*([A-Za-z0-9\/.\- ]{3,30})/i
        );


    if (expiryMatch) {

        bestBefore =
            expiryMatch[1]
                .trim();

    }


    // ==================================================
    // BATCH NUMBER
    // ==================================================

    let batchNumber = "Not detected";


    const batchMatch =
        rawText.match(
            /(?:BATCH\s*(?:NO|NUMBER)?|LOT\s*(?:NO|NUMBER)?)\s*[:.#-]?\s*([A-Z0-9\/-]{2,30})/i
        );


    if (batchMatch) {

        batchNumber =
            batchMatch[1]
                .trim();

    }


    // ==================================================
    // FSSAI
    // ==================================================

    let fssai = "Not detected";


    const fssaiMatch =
        rawText.match(
            /(?:FSSAI|LIC\.?\s*NO\.?|LICENSE\s*NO\.?)\s*[:.]?\s*(\d{8,14})/i
        );


    if (fssaiMatch) {

        fssai =
            fssaiMatch[1];

    }

    else if (/FSSAI/i.test(rawText)) {

        fssai =
            "Detected";

    }


    // ==================================================
    // MANUFACTURER
    // ==================================================

    let manufacturer =
        "Not detected";


    // Known manufacturer

    if (/REEGAL\s+INDUSTRIES/i.test(rawText)) {

        manufacturer =
            "Reegal Industries";

    }


    else {

        const manufacturerMatch =
            rawText.match(
                /(?:MANUFACTURED\s*(?:FOR|BY)?|MARKETED\s*BY|MANUFACTURER)\s*[:.]?\s*([A-Z][A-Z\s&.,'-]{3,80})/i
            );


        if (manufacturerMatch) {

            manufacturer =
                manufacturerMatch[1]
                    .replace(/\s+/g, " ")
                    .trim();


            manufacturer =
                manufacturer
                    .replace(
                        /\s+(GUT|VILLAGE|PINCODE|EMAIL|TEL)\b.*$/i,
                        ""
                    )
                    .trim();

        }

    }


    // ==================================================
    // RETURN PRODUCT INFORMATION
    // ==================================================

    return {

        category,

        productName,

        mrp,

        netQuantity,

        pages,

        size,

        bestBefore,

        batchNumber,

        fssai,

        manufacturer

    };

}


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    extractProductInfo

};