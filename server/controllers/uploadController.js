const { cloudinary, isCloudinaryReady } = require("../config/cloudinary");

// Sends the file's bytes to Cloudinary and waits for the result
const sendToCloudinary = (buffer) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "examprep/questions", resource_type: "image" },
            (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(buffer);
    });

// POST /api/admin/upload   (form field "image")
const uploadQuestionImage = async (req, res) => {
    try {
        if (!isCloudinaryReady()) {
            return res.status(503).json({ message: "Image uploads are not set up yet. Add the Cloudinary keys to server/.env" });
        }
        if (!req.file) return res.status(400).json({ message: "Choose an image to upload" });

        const result = await sendToCloudinary(req.file.buffer);
        res.status(201).json({ image: { url: result.secure_url, publicId: result.public_id } });
    } catch (error) {
        console.error("uploadQuestionImage error:", error.message);
        res.status(500).json({ message: "Upload failed. Check the Cloudinary keys in server/.env" });
    }
};

module.exports = { uploadQuestionImage };