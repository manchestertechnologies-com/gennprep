const mongoose = require("mongoose");

const examSchema = new mongoose.Schema(
    {
        code: { type: String, required: true, unique: true, uppercase: true }, // NEET, JEE, KCET
        name: { type: String, required: true },
        slug: { type: String, required: true, unique: true, lowercase: true },
        description: { type: String, default: "" },
        markingScheme: {
            correct: { type: Number, default: 4 },
            incorrect: { type: Number, default: -1 },
            unanswered: { type: Number, default: 0 },
        },
        durationMinutes: { type: Number, default: 180 },
        order: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Exam", examSchema);