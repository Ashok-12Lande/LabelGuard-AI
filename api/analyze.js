module.exports = async (req, res) => {

    console.log("================================");
    console.log("LABELGUARD API REQUEST");
    console.log("METHOD:", req.method);
    console.log("URL:", req.url);
    console.log("================================");


    // ==============================
    // GET TEST
    // ==============================

    if (req.method === "GET") {

        return res.status(200).json({

            success: true,

            message:
                "LabelGuard AI API is working on Vercel!",

            method:
                req.method

        });

    }


    // ==============================
    // POST TEST
    // ==============================

    if (req.method === "POST") {

        return res.status(200).json({

            success: true,

            message:
                "POST request received successfully!",

            method:
                req.method

        });

    }


    // ==============================
    // OTHER METHODS
    // ==============================

    return res.status(405).json({

        success: false,

        message:
            "Method not allowed.",

        method:
            req.method

    });

};