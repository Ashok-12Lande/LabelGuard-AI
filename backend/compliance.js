// ======================================================
// LABELGUARD AI - COMPLIANCE ENGINE
// ======================================================


// ======================================================
// MAIN COMPLIANCE FUNCTION
// ======================================================

function checkCompliance(product) {

    const category =
        product.category || "Unknown";


    // ==================================================
    // REQUIRED FIELDS BY CATEGORY
    // ==================================================

    let requiredFields = [];


    // ==================================================
    // STATIONERY
    // ==================================================

    if (category === "Stationery") {

        requiredFields = [

            {
                field: "Product Name",
                key: "productName"
            },

            {
                field: "MRP",
                key: "mrp"
            },

            {
                field: "Pages",
                key: "pages"
            },

            {
                field: "Size",
                key: "size"
            },

            {
                field: "Manufacturer",
                key: "manufacturer"
            }

        ];

    }


    // ==================================================
    // FOOD
    // ==================================================

    else if (category === "Food") {

        requiredFields = [

            {
                field: "Product Name",
                key: "productName"
            },

            {
                field: "MRP",
                key: "mrp"
            },

            {
                field: "Net Quantity",
                key: "netQuantity"
            },

            {
                field: "Best Before / Expiry",
                key: "bestBefore"
            },

            {
                field: "Batch / Lot Number",
                key: "batchNumber"
            },

            {
                field: "FSSAI Licence",
                key: "fssai"
            },

            {
                field: "Manufacturer / Packer",
                key: "manufacturer"
            }

        ];

    }


    // ==================================================
    // COSMETICS
    // ==================================================

    else if (category === "Cosmetics") {

        requiredFields = [

            {
                field: "Product Name",
                key: "productName"
            },

            {
                field: "MRP",
                key: "mrp"
            },

            {
                field: "Net Quantity",
                key: "netQuantity"
            },

            {
                field: "Batch Number",
                key: "batchNumber"
            },

            {
                field: "Manufacturer",
                key: "manufacturer"
            }

        ];

    }


    // ==================================================
    // UNKNOWN CATEGORY
    // ==================================================

    else {

        requiredFields = [

            {
                field: "Product Name",
                key: "productName"
            },

            {
                field: "MRP",
                key: "mrp"
            },

            {
                field: "Manufacturer",
                key: "manufacturer"
            }

        ];

    }


    // ==================================================
    // CHECK REQUIRED FIELDS
    // ==================================================

    const checks =
        requiredFields.map(item => {

            const value =
                product[item.key];


            // Convert value to string safely

            const stringValue =
                value === undefined ||
                value === null
                    ? ""
                    : String(value).trim();


            // Check whether field was detected

            const found =
                stringValue !== "" &&
                stringValue.toLowerCase() !== "not detected" &&
                stringValue.toLowerCase() !== "not detected.";


            return {

                field:
                    item.field,

                key:
                    item.key,

                value:
                    found
                        ? value
                        : "Not detected",

                status:
                    found
                        ? "FOUND"
                        : "NEEDS REVIEW"

            };

        });


    // ==================================================
    // CALCULATE SUMMARY
    // ==================================================

    const total =
        checks.length;


    const found =
        checks.filter(
            check =>
                check.status === "FOUND"
        ).length;


    const needsReview =
        total - found;


    // ==================================================
    // COMPLIANCE SCORE
    // ==================================================

    let percentage = 0;


    if (total > 0) {

        percentage =
            Math.round(
                (found / total) * 100
            );

    }


    // ==================================================
    // OVERALL STATUS
    // ==================================================

    let status;


    if (percentage === 100) {

        status =
            "COMPLIANT";

    }
    else {

        status =
            "NEEDS REVIEW";

    }


    // ==================================================
    // MISSING FIELDS
    // ==================================================

    const missingFields =
        checks
            .filter(
                check =>
                    check.status ===
                    "NEEDS REVIEW"
            )
            .map(
                check =>
                    check.field
            );


    // ==================================================
    // RETURN COMPLIANCE RESULT
    // ==================================================

    return {

        category:

            category,


        status:

            status,


        score:

            percentage,


        checks:

            checks,


        missingFields:

            missingFields,


        summary: {

            total:

                total,

            found:

                found,

            needsReview:

                needsReview,

            percentage:

                percentage

        }

    };

}


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    checkCompliance

};