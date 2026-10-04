const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema(
    {
        examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
        subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, lowercase: true },
        classLevel: { type: String, enum: ["11", "12"], required: true },
        weightage: { type: Number, default: 0 }, // expected % of the paper
        order: { type: Number, default: 0 },
        questionCount: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

chapterSchema.index({ subjectId: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model("Chapter", chapterSchema);