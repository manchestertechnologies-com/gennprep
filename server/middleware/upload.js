const multer = require("multer");

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Keeps the file in memory (not on disk), at most 2 MB, images only
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (ALLOWED.includes(file.mimetype)) return cb(null, true);
        cb(Object.assign(new Error("Only JPG, PNG, WEBP or GIF images are allowed"), { status: 400 }));
    },
});

// Reads one file from the "image" field and turns any problem into a clean message
const uploadImage = (req, res, next) => {
    upload.single("image")(req, res, (err) => {
        if (!err) return next();
        if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({ message: "Image must be 2 MB or smaller" });
        }
        return res.status(err.status || 400).json({ message: err.message });
    });
};

module.exports = uploadImage;