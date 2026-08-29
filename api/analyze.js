module.exports = (req, res) => {
    res.status(200).json({
        success: true,
        message: "LabelGuard AI API is working on Vercel!"
    });
};