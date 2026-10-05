const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, lowercase: true, trim: true },
        purpose: { type: String, enum: ["reset_password", "verify_email"], required: true },
        codeHash: { type: String, required: true }, // the code is scrambled, like a password
        attempts: { type: Number, default: 0 },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true }
);

// MongoDB deletes each code automatically once expiresAt has passed
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
otpSchema.index({ email: 1, purpose: 1 });

module.exports = mongoose.model("Otp", otpSchema);