const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema(
    {
        examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
        subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
        chapterId: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter", required: true },
        name: { type: String, required: true, trim: true },
        slug: { type: String, required: true, lowercase: true },
        order: { type: Number, default: 0 },
        questionCount: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

topicSchema.index({ chapterId: 1, slug: 1 }, { unique: true });

module.exports = mongoose.model("Topic", topicSchema);