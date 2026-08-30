module.exports = (req, res) => {

    if (req.method === "GET") {

        return res.status(200).json({
            success: true,
            message: "LabelGuard AI API is working on Vercel!"
        });

    }


    if (req.method === "POST") {

        return res.status(200).json({
            success: true,
            message: "POST request received successfully!",
            note: "Vercel serverless function is working."
        });

    }


    return res.status(405).json({
        success: false,
        message: "Method not allowed."
    });

};