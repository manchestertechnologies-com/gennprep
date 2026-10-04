const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
    {
        examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, lowercase: true },
        order: { type: Number, default: 0 },
        questionCount: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// The same subject name can't appear twice in one exam
subjectSchema.index({ examId: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model("Subject", subjectSchema);