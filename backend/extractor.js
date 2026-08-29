function normalizeText(text) {

    return text
        .replace(/\r/g, "")
        .replace(/[ \t]+/g, " ")
        .trim();

}


function extractProductInfo(rawText) {

    const text = normalizeText(rawText);


    // ======================================================
    // PRODUCT CATEGORY
    // ======================================================

    let category = "Unknown";


    if (
        /notebook|exercise\s*book|pages|page\s*no|stationery/i.test(text)
    ) {

        category = "Stationery";

    }
    else if (
        /fssai|ingredients|nutrition|net\s*(weight|quantity)|best\s*before/i.test(text)
    ) {

        category = "Food";

    }
    else if (
        /cosmetic|ingredients|manufactured\s*by|batch\s*no/i.test(text)
    ) {

        category = "Cosmetics";

    }


    // ======================================================
    // PRODUCT NAME
    // ======================================================

    let productName = "Not detected";


    if (/parle[\s-]*g/i.test(text)) {

        productName = "Parle-G Biscuits";

    }
    else if (/exercise[\s\n]+notebook/i.test(rawText)) {

        productName = "Exercise Notebook";

    }
    else if (/notebook/i.test(text)) {

        productName = "Notebook";

    }


    // ======================================================
    // MRP
    // ======================================================

    let mrp = "Not detected";


    const mrpMatch = rawText.match(
        /M\s*\.?\s*R\s*\.?\s*P\s*\.?\s*[A-Z₹RsINR:.\- ]{0,15}(\d+(?:\.\d+)?)\s*(?:\/\s*-)?/i
    );


    if (mrpMatch) {

        mrp = `₹ ${mrpMatch[1]}`;

    }


    // Backup MRP detection

    if (mrp === "Not detected") {

        const backupMrp = rawText.match(
            /(?:M\.?\s*R\.?\s*P\.?|MRP)[^0-9]{0,20}(\d+(?:\.\d+)?)\s*(?:\/-)?/i
        );


        if (backupMrp) {

            mrp = `₹ ${backupMrp[1]}`;

        }

    }


    // ======================================================
    // PAGES
    // ======================================================

    let pages = "Not detected";


    const pagesMatch = rawText.match(
        /PAGES?\s*[:.\-]?\s*(\d+)/i
    );


    if (pagesMatch) {

        pages = pagesMatch[1];

    }


    // ======================================================
    // SIZE
    // ======================================================

    let size = "Not detected";


    const sizePatterns = [

        // SIZE: 21 CM X 29.7 CM
        /SIZE\s*[:.\-]?\s*(\d+(?:\.\d+)?)\s*CM\s*[Xx×]\s*(\d+(?:\.\d+)?)\s*CM/i,

        // SIZE 21 X 29.7 CM
        /SIZE\s*[:.\-]?\s*(\d+(?:\.\d+)?)\s*[Xx×]\s*(\d+(?:\.\d+)?)\s*CM/i,

        // 21 CM X 29.7 CM
        /(\d+(?:\.\d+)?)\s*CM\s*[Xx×]\s*(\d+(?:\.\d+)?)\s*CM/i,

        // 21 X 29.7
        /SIZE\s*[:.\-]?\s*(\d+(?:\.\d+)?)\s*[Xx×]\s*(\d+(?:\.\d+)?)/i

    ];


    for (const pattern of sizePatterns) {

        const match = rawText.match(pattern);


        if (match) {

            size =
                `${match[1]} CM X ${match[2]} CM`;

            break;

        }

    }


    // ======================================================
    // NET QUANTITY
    // ======================================================

    let netQuantity = "Not detected";


    const isNotebook =
        /notebook/i.test(text);


    if (!isNotebook) {

        const quantityMatch = rawText.match(
            /(?:NET\s*(?:WEIGHT|WT|QTY|QUANTITY))\s*[:.]?\s*(\d+(?:\.\d+)?)\s*(KG|G|GM|ML|L|PCS|PIECES|PACK)/i
        );


        if (quantityMatch) {

            netQuantity =
                `${quantityMatch[1]} ${quantityMatch[2].toUpperCase()}`;

        }

    }


    // ======================================================
    // BEST BEFORE / EXPIRY
    // ======================================================

    let bestBefore = "Not detected";


    const expiryMatch = rawText.match(
        /(?:BEST\s*BEFORE|USE\s*BY|EXPIRY|EXP\.?\s*DATE)\s*[:.]?\s*([A-Za-z0-9\/.\- ]{3,30})/i
    );


    if (expiryMatch) {

        bestBefore =
            expiryMatch[1].trim();

    }


    // ======================================================
    // BATCH NUMBER
    // ======================================================

    let batchNumber = "Not detected";


    const batchMatch = rawText.match(
        /(?:BATCH\s*(?:NO|NUMBER)?|LOT\s*(?:NO|NUMBER)?)\s*[:.#-]?\s*([A-Z0-9\/-]{2,30})/i
    );


    if (batchMatch) {

        batchNumber =
            batchMatch[1].trim();

    }


    // ======================================================
    // FSSAI
    // ======================================================

    let fssai = "Not detected";


    const fssaiMatch = rawText.match(
        /(?:FSSAI|LIC\.?\s*NO\.?|LICENSE\s*NO\.?)\s*[:.]?\s*(\d{8,14})/i
    );


    if (fssaiMatch) {

        fssai = fssaiMatch[1];

    }
    else if (/FSSAI/i.test(rawText)) {

        fssai = "Detected";

    }


    // ======================================================
    // MANUFACTURER
    // ======================================================

    let manufacturer = "Not detected";


    if (/REEGAL\s+INDUSTRIES/i.test(rawText)) {

        manufacturer =
            "Reegal Industries";

    }
    else {

        const manufacturerMatch = rawText.match(
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


    // ======================================================
    // RETURN PRODUCT INFORMATION
    // ======================================================

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


module.exports = {

    extractProductInfo

};